#!/bin/bash
set -euo pipefail
exec > /var/log/user-data-monitoring.log 2>&1

echo "=== FittNutri Monitoring boot $(date) ==="

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
chmod 644 /etc/prometheus/prometheus.yml

# 2. Grafana secrets
mkdir -p /etc/fittnutri
cat > /etc/fittnutri/grafana.env <<EOF
GF_SECURITY_ADMIN_USER=${grafana_admin_user}
GF_SECURITY_ADMIN_PASSWORD=${grafana_admin_password}
GF_SERVER_ROOT_URL=https://${app_domain}/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true
EOF
chmod 600 /etc/fittnutri/grafana.env

# 3. Grafana provisioning — datasource
mkdir -p /etc/grafana/provisioning/datasources \
         /etc/grafana/provisioning/dashboards \
         /etc/grafana/dashboards

cat > /etc/grafana/provisioning/datasources/prometheus.yml <<EOF
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://fittnutri-prometheus:9090
    isDefault: true
    editable: false
EOF

# 4. Grafana provisioning — loader de dashboards do diretorio
cat > /etc/grafana/provisioning/dashboards/fittnutri.yml <<EOF
apiVersion: 1
providers:
  - name: FittNutri
    folder: FittNutri
    type: file
    disableDeletion: true
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/dashboards
EOF

# 5. Dashboard FittNutri — baixa do repositorio e extrai o objeto .dashboard
DASHBOARD_URL="https://raw.githubusercontent.com/Grupo-6-ADS-B/FittNutri/${git_branch}/terraform/fittnutri-dashboard.json"
curl -fsSL "$DASHBOARD_URL" | python3 -c "
import json, sys
data = json.load(sys.stdin)
dash = data.get('dashboard', data)
dash['id'] = None
print(json.dumps(dash, ensure_ascii=False))
" > /etc/grafana/dashboards/fittnutri-main.json

chmod -R 755 /etc/grafana

# 6. Rede docker para comunicacao interna Prometheus <-> Grafana
docker network create monitoring 2>/dev/null || true

# 7. Volumes persistentes
docker volume create prom_data >/dev/null
docker volume create graf_data >/dev/null

# 8. Prometheus
docker rm -f fittnutri-prometheus 2>/dev/null || true
docker run -d \
  --name fittnutri-prometheus \
  --restart unless-stopped \
  --network monitoring \
  -p 9090:9090 \
  -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  -v prom_data:/prometheus \
  prom/prometheus:latest

# 9. Grafana — com provisionamento montado (datasource + dashboard ja configurados)
docker rm -f fittnutri-grafana 2>/dev/null || true
docker run -d \
  --name fittnutri-grafana \
  --restart unless-stopped \
  --network monitoring \
  -p 3000:3000 \
  -v graf_data:/var/lib/grafana \
  -v /etc/grafana/provisioning:/etc/grafana/provisioning:ro \
  -v /etc/grafana/dashboards:/etc/grafana/dashboards:ro \
  --env-file /etc/fittnutri/grafana.env \
  grafana/grafana:latest

echo "=== Containers iniciados $(date) ==="
docker ps --format 'table {{.Names}}\t{{.Ports}}'

# 10. Dashboards da comunidade (JVM + Spring Boot) via API em background
cat > /usr/local/bin/grafana-community-dashboards.sh <<'PROVISION'
#!/bin/bash
set -euo pipefail
exec >> /var/log/grafana-provision.log 2>&1

echo "=== Dashboards comunidade: $(date) ==="

GRAFANA_USER=$(grep GF_SECURITY_ADMIN_USER /etc/fittnutri/grafana.env | cut -d= -f2 | tr -d '\r\n')
GRAFANA_PASS=$(grep GF_SECURITY_ADMIN_PASSWORD /etc/fittnutri/grafana.env | cut -d= -f2 | tr -d '\r\n')
GRAFANA_URL="http://localhost:3000"

echo "Aguardando Grafana..."
for i in $(seq 1 40); do
  if curl -sf "$GRAFANA_URL/api/health" >/dev/null 2>&1; then
    echo "Grafana pronto apos $i tentativas"
    break
  fi
  sleep 5
done

import_dashboard() {
  local id=$1
  local name=$2
  echo "Importando $name (id=$id)..."
  local json
  json=$(curl -fsSL "https://grafana.com/api/dashboards/$id/revisions/latest/download") || { echo "Falha ao baixar $name"; return; }
  curl -sf -X POST "$GRAFANA_URL/api/dashboards/import" \
    -u "$GRAFANA_USER:$GRAFANA_PASS" \
    -H "Content-Type: application/json" \
    --data-binary "{\"dashboard\":$json,\"overwrite\":true,\"inputs\":[{\"name\":\"DS_PROMETHEUS\",\"type\":\"datasource\",\"pluginId\":\"prometheus\",\"value\":\"Prometheus\"}]}" \
    2>&1 | head -c 200
  echo ""
}

import_dashboard 4701  "JVM Micrometer"
import_dashboard 12900 "Spring Boot APM"

echo "=== Dashboards comunidade concluidos: $(date) ==="
PROVISION

chmod +x /usr/local/bin/grafana-community-dashboards.sh
nohup /usr/local/bin/grafana-community-dashboards.sh &

echo "=== Monitoring up $(date) ==="
