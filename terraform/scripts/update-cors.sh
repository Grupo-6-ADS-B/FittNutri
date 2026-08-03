#!/bin/bash
set -euo pipefail
exec >> /var/log/user-data.log 2>&1

echo "=== update-cors $(date) ==="
APP_DIR=/home/ubuntu/FittNutri
cd "$APP_DIR"

sudo -u ubuntu git fetch origin
sudo -u ubuntu git reset --hard origin/claude-test

echo "Codigo atualizado:"
sudo -u ubuntu git log --oneline -2

# Rebuild apenas do backend (mudanca no SecurityConfig)
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --force-recreate backend
echo "=== backend recriado $(date) ==="
