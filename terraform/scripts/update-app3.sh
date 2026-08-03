#!/bin/bash
set -euo pipefail
exec >> /var/log/user-data.log 2>&1

echo "=== update-app3 $(date) ==="

APP_DIR=/home/ubuntu/FittNutri

cd "$APP_DIR"

# Descartar mudancas locais (foram aplicadas via git no repositorio)
sudo -u ubuntu git checkout -- .
sudo -u ubuntu git fetch origin
sudo -u ubuntu git reset --hard origin/claude-test

echo "Codigo atualizado para:"
sudo -u ubuntu git log --oneline -3

# Remover credenciais AWS do .env
sed -i '/^AWS_ACCESS_KEY_ID=/d' .env
sed -i '/^AWS_SECRET_ACCESS_KEY=/d' .env
sed -i '/^AWS_SESSION_TOKEN=/d' .env

echo "Credenciais AWS removidas do .env"

# Rebuild backend com novo S3Config (usa DefaultCredentialsProvider)
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --force-recreate backend

echo "=== update concluido $(date) ==="
docker compose -f docker-compose.prod.yml ps
