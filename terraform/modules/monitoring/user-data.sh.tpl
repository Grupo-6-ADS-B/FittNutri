#!/bin/bash
set -euo pipefail
exec > /var/log/user-data-monitoring.log 2>&1

echo "=== FittNutri Monitoring boot $$(date) ==="

command -v docker >/dev/null 2>&1 || (curl -fsSL https://get.docker.com | sh)

# 1. Prometheus config (scrape no App :8080)
mkdir -p /etc/prometheus
cat > /etc/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: fittnutri-backend
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ['${app_private_ip}:8080']
EOF
# Prometheus container roda como usuario nao-root — precisa ser legivel por todos
chmod 644 /etc/prometheus/prometheus.yml

# 2. Secrets do Grafana — fora da linha de comando
mkdir -p /etc/fittnutri
cat > /etc/fittnutri/grafana.env <<EOF
GF_SECURITY_ADMIN_USER=${grafana_admin_user}
GF_SECURITY_ADMIN_PASSWORD=${grafana_admin_password}
GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true
EOF
chmod 600 /etc/fittnutri/grafana.env

# 3. Rede docker para comunicacao interna Prometheus <-> Grafana
docker network create monitoring 2>/dev/null || true

# 4. Volumes persistentes
docker volume create prom_data >/dev/null
docker volume create graf_data >/dev/null

# 5. Prometheus
docker rm -f fittnutri-prometheus 2>/dev/null || true
docker run -d \
  --name fittnutri-prometheus \
  --restart unless-stopped \
  --network monitoring \
  -p 9090:9090 \
  -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  -v prom_data:/prometheus \
  prom/prometheus:latest

# 6. Grafana
docker rm -f fittnutri-grafana 2>/dev/null || true
docker run -d \
  --name fittnutri-grafana \
  --restart unless-stopped \
  --network monitoring \
  -p 3000:3000 \
  -v graf_data:/var/lib/grafana \
  --env-file /etc/fittnutri/grafana.env \
  grafana/grafana:latest

echo "=== Containers iniciados $$(date) ==="
docker ps --format 'table {{.Names}}\t{{.Ports}}'

# 7. Aguarda Grafana estar pronto e provisiona datasource + dashboards
cat > /usr/local/bin/grafana-provision.sh <<'PROVISION'
#!/bin/bash
set -euo pipefail
exec >> /var/log/grafana-provision.log 2>&1

echo "=== Provisionamento Grafana: $$(date) ==="

GRAFANA_USER=$$(grep GF_SECURITY_ADMIN_USER /etc/fittnutri/grafana.env | cut -d= -f2 | tr -d '\r\n')
GRAFANA_PASS=$$(grep GF_SECURITY_ADMIN_PASSWORD /etc/fittnutri/grafana.env | cut -d= -f2 | tr -d '\r\n')
GRAFANA_URL="http://localhost:3000"

# Aguarda Grafana responder
echo "Aguardando Grafana..."
for i in $$(seq 1 40); do
  if curl -sf "$$GRAFANA_URL/api/health" >/dev/null 2>&1; then
    echo "Grafana pronto apos $$i tentativas"
    break
  fi
  sleep 5
done

# Cria datasource Prometheus (ignora erro se ja existir)
echo "Criando datasource Prometheus..."
curl -sf -X POST "$$GRAFANA_URL/api/datasources" \
  -u "$$GRAFANA_USER:$$GRAFANA_PASS" \
  -H "Content-Type: application/json" \
  -d '{"name":"Prometheus","type":"prometheus","access":"proxy","url":"http://fittnutri-prometheus:9090","isDefault":true}' \
  2>&1 || true
echo ""

# Importa dashboard JVM Micrometer (4701) — heap, GC, threads, CPU
echo "Importando dashboard JVM Micrometer..."
JVM_JSON=$$(curl -fsSL "https://grafana.com/api/dashboards/4701/revisions/latest/download")
curl -sf -X POST "$$GRAFANA_URL/api/dashboards/import" \
  -u "$$GRAFANA_USER:$$GRAFANA_PASS" \
  -H "Content-Type: application/json" \
  --data-binary "{\"dashboard\":$$JVM_JSON,\"overwrite\":true,\"inputs\":[{\"name\":\"DS_PROMETHEUS\",\"type\":\"datasource\",\"pluginId\":\"prometheus\",\"value\":\"Prometheus\"}]}" \
  2>&1 | head -c 200
echo ""

# Importa dashboard Spring Boot APM (12900) — HTTP, endpoints, latencia
echo "Importando dashboard Spring Boot APM..."
SB_JSON=$$(curl -fsSL "https://grafana.com/api/dashboards/12900/revisions/latest/download")
curl -sf -X POST "$$GRAFANA_URL/api/dashboards/import" \
  -u "$$GRAFANA_USER:$$GRAFANA_PASS" \
  -H "Content-Type: application/json" \
  --data-binary "{\"dashboard\":$$SB_JSON,\"overwrite\":true,\"inputs\":[{\"name\":\"DS_PROMETHEUS\",\"type\":\"datasource\",\"pluginId\":\"prometheus\",\"value\":\"Prometheus\"}]}" \
  2>&1 | head -c 200
echo ""

echo "=== Provisionamento concluido: $$(date) ==="
PROVISION

chmod +x /usr/local/bin/grafana-provision.sh

# Executa o provisionamento em background (nao bloqueia o user-data)
nohup /usr/local/bin/grafana-provision.sh &

echo "=== Monitoring up $$(date) ==="
