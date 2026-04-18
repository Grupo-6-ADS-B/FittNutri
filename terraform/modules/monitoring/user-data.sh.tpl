#!/bin/bash
set -euo pipefail
exec > /var/log/user-data-monitoring.log 2>&1
umask 077

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

# 2. Secrets do Grafana — fora da linha de comando
mkdir -p /etc/fittnutri
cat > /etc/fittnutri/grafana.env <<EOF
GF_SECURITY_ADMIN_USER=${grafana_admin_user}
GF_SECURITY_ADMIN_PASSWORD=${grafana_admin_password}
GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true
EOF
chmod 600 /etc/fittnutri/grafana.env

# 3. Volumes persistentes
docker volume create prom_data >/dev/null
docker volume create graf_data >/dev/null

# 4. Prometheus
docker rm -f fittnutri-prometheus 2>/dev/null || true
docker run -d \
  --name fittnutri-prometheus \
  --restart unless-stopped \
  -p 9090:9090 \
  -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  -v prom_data:/prometheus \
  prom/prometheus:latest

# 5. Grafana com --env-file (senha nao aparece em docker inspect)
docker rm -f fittnutri-grafana 2>/dev/null || true
docker run -d \
  --name fittnutri-grafana \
  --restart unless-stopped \
  -p 3000:3000 \
  -v graf_data:/var/lib/grafana \
  --env-file /etc/fittnutri/grafana.env \
  grafana/grafana:latest

echo "=== Monitoring up $$(date) ==="
docker ps --format 'table {{.Names}}\t{{.Ports}}'
