#!/bin/bash
set -euo pipefail

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

CREDS=$(curl -s \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  "http://169.254.169.254/latest/meta-data/iam/security-credentials/LabRole")

ACCESS=$(echo "$CREDS" | grep -o '"AccessKeyId" *: *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
SECRET=$(echo "$CREDS" | grep -o '"SecretAccessKey" *: *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
STOKEN=$(echo "$CREDS" | grep -o '"Token" *: *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')

ENV_FILE="/home/ubuntu/FittNutri/.env"

# Remove entradas antigas se existirem
sed -i '/^AWS_ACCESS_KEY_ID=/d' "$ENV_FILE"
sed -i '/^AWS_SECRET_ACCESS_KEY=/d' "$ENV_FILE"
sed -i '/^AWS_SESSION_TOKEN=/d' "$ENV_FILE"

echo "AWS_ACCESS_KEY_ID=$ACCESS" >> "$ENV_FILE"
echo "AWS_SECRET_ACCESS_KEY=$SECRET" >> "$ENV_FILE"
echo "AWS_SESSION_TOKEN=$STOKEN" >> "$ENV_FILE"

echo "Credenciais injetadas: ACCESS=${ACCESS:0:10}..."

cd /home/ubuntu/FittNutri
docker compose -f docker-compose.prod.yml --env-file .env restart backend
echo "Backend reiniciado"
