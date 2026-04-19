#!/bin/bash
set -euo pipefail

# ============================================================
# FittNutri — User Data (provisionamento via Terraform)
# SSL terminado no ALB — sem Certbot/Let's Encrypt na EC2
# ============================================================

exec > /var/log/user-data.log 2>&1
umask 077

echo "=============================="
echo " FittNutri — User Data Init"
echo " $(date)"
echo "=============================="

APP_DIR="/home/ubuntu/FittNutri"

# --- 1. Atualizar sistema ---
echo "[1/7] Atualizando sistema..."
apt-get update -y

# --- 2. Instalar Docker (com guard) ---
echo "[2/7] Verificando Docker..."
if ! command -v docker &> /dev/null; then
  echo "Docker não encontrado — instalando..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker ubuntu
fi

# --- 3. Instalar docker-compose (com guard) ---
echo "[3/7] Verificando docker-compose..."
if ! command -v docker-compose &> /dev/null; then
  echo "docker-compose não encontrado — instalando..."
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

# --- 4. Instalar dependências ---
echo "[4/7] Instalando git e jq..."
apt-get install -y git jq

# --- 5. Clonar ou atualizar repositório ---
echo "[5/7] Clonando/atualizando repositório..."
if [ ! -d "$APP_DIR" ]; then
  git clone -b ${git_branch} ${git_repo} "$APP_DIR"
  chown -R ubuntu:ubuntu "$APP_DIR"
else
  cd "$APP_DIR"
  git fetch origin
  git checkout ${git_branch}
  git pull origin ${git_branch}
fi

cd "$APP_DIR"

# --- 6. Gerar .env com variáveis injetadas pelo Terraform ---
echo "[6/7] Gerando .env..."
cat > "$APP_DIR/.env" <<'ENVEOF'
DB_HOST=${app_db_host}
DB_PORT=${app_db_port}
MYSQL_ROOT_PASSWORD=${app_db_password}
MYSQL_DATABASE=${app_db_name}
SPRING_DATASOURCE_URL=jdbc:mysql://${app_db_host}:${app_db_port}/${app_db_name}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${app_db_username}
SPRING_DATASOURCE_PASSWORD=${app_db_password}
JWT_SECRET=${app_jwt_secret}
JWT_VALIDITY=${app_jwt_validity}
APP_AES_KEY=${app_aes_key}
FRONTEND_URL=${app_frontend_url}
RABBITMQ_URL=${app_rabbitmq_url}
AWS_REGION=${aws_region}
AWS_S3_BUCKET=${app_s3_bucket}
SPRING_PROFILES_ACTIVE=${app_spring_profile}
ENVEOF

chown ubuntu:ubuntu "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

# --- 7. Build e subir containers com compose.prod.yml ---
echo "[7/7] Build + up via docker-compose.prod.yml (pode levar 5-10 min no primeiro build)..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo ""
echo "=============================="
echo " Deploy concluído! $(date)"
echo "=============================="

docker compose -f docker-compose.prod.yml ps
