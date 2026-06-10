#!/bin/bash
set -euo pipefail
exec >> /var/log/user-data.log 2>&1

echo "=== update-app $(date) ==="

APP_DIR=/home/ubuntu/FittNutri

# Corrigir ownership e permissao git para root
git config --global --add safe.directory "$APP_DIR"

cd "$APP_DIR"

# Atualizar código como ubuntu
sudo -u ubuntu git fetch origin
sudo -u ubuntu git checkout claude-test
sudo -u ubuntu git pull origin claude-test

# Remover credenciais AWS do .env (nao mais necessarias com DefaultCredentialsProvider)
sed -i '/^AWS_ACCESS_KEY_ID=/d' .env
sed -i '/^AWS_SECRET_ACCESS_KEY=/d' .env
sed -i '/^AWS_SESSION_TOKEN=/d' .env

echo "Credenciais AWS removidas do .env"

# Rebuild e restart do backend com nova imagem
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --force-recreate backend

echo "=== update concluido $(date) ==="
docker compose -f docker-compose.prod.yml ps
