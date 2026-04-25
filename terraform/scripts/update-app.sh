#!/bin/bash
set -euo pipefail
exec >> /var/log/user-data.log 2>&1

echo "=== update-app $(date) ==="

cd /home/ubuntu/FittNutri

# Atualizar código
git fetch origin
git checkout claude-test
git pull origin claude-test

# Remover credenciais AWS do .env (nao mais necessarias com DefaultCredentialsProvider)
sed -i '/^AWS_ACCESS_KEY_ID=/d' .env
sed -i '/^AWS_SECRET_ACCESS_KEY=/d' .env
sed -i '/^AWS_SESSION_TOKEN=/d' .env

echo "Credenciais AWS removidas do .env"
echo "Variaveis restantes no .env:"
grep -v PASSWORD .env | grep -v SECRET | grep -v KEY | grep -v TOKEN || true

# Rebuild e restart do backend com nova imagem
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --force-recreate backend

echo "=== update concluido $(date) ==="
docker compose -f docker-compose.prod.yml ps
