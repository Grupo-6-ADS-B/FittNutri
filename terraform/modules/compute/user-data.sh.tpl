#!/bin/bash
set -e

# ============================================================
# FittNutri — User Data (provisionamento via Terraform)
# Baseado no setup-ec2.sh original, com SSL/Certbot integrado
# ============================================================

exec > /var/log/user-data.log 2>&1

echo "=============================="
echo " FittNutri — User Data Init"
echo " $(date)"
echo "=============================="

APP_DIR="/home/ubuntu/FittNutri"

# --- 1. Atualizar sistema ---
echo "[1/8] Atualizando sistema..."
apt-get update -y && apt-get upgrade -y

# --- 2. Instalar Docker ---
echo "[2/8] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker ubuntu
fi

# --- 3. Instalar docker-compose (com hífen) ---
echo "[3/8] Instalando docker-compose..."
if ! command -v docker-compose &> /dev/null; then
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

# --- 4. Instalar Git e utilitários ---
echo "[4/8] Instalando Git e utilitários..."
apt-get install -y git awscli jq

# --- 5. Clonar repositório ---
echo "[5/8] Clonando repositório..."
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

# --- 6. Configurar .env ---
echo "[6/8] Configurando .env..."
if aws secretsmanager get-secret-value --secret-id ${project}/env --region ${aws_region} --query 'SecretString' --output text > /tmp/env_secret 2>/dev/null; then
  echo "Secrets encontrados no Secrets Manager"
  jq -r 'to_entries[] | "\(.key)=\(.value)"' /tmp/env_secret > "$APP_DIR/.env"
  rm -f /tmp/env_secret
else
  echo "Secrets Manager não disponível. Usando .env.example como base."
  if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  fi
fi

# --- 7. Build das imagens Docker ---
echo "[7/8] Construindo imagens Docker..."
cd "$APP_DIR"
sg docker -c "bash manage.sh build" 2>/dev/null || bash manage.sh build

# --- 8. SSL/Certbot + Start ---
echo "[8/8] Configurando SSL e iniciando aplicação..."

%{ if app_email != "" ~}
# Email configurado — emitir certificado SSL
echo "Emitindo certificado SSL para ${domain}..."

# Sobe nginx em HTTP temporariamente para challenge do Certbot
sg docker -c "docker-compose --env-file .env up -d nginx" 2>/dev/null || \
  docker-compose --env-file .env up -d nginx

sleep 5

# Emite certificado via Certbot
sg docker -c "docker-compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d ${domain} \
  --email ${app_email} --agree-tos --no-eff-email --non-interactive" 2>/dev/null || \
  docker-compose run --rm certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    -d "${domain}" \
    --email "${app_email}" --agree-tos --no-eff-email --non-interactive

# Derrubar nginx para reiniciar com SSL completo
sg docker -c "docker-compose down" 2>/dev/null || docker-compose down

echo "Certificado SSL obtido! Iniciando aplicação completa..."
%{ else ~}
echo "Email não configurado — pulando SSL. Aplicação rodará em HTTP."
%{ endif ~}

# Start completo
sg docker -c "bash manage.sh start" 2>/dev/null || bash manage.sh start

echo ""
echo "=============================="
echo " Deploy concluído! $(date)"
echo " Domínio: ${domain}"
%{ if app_email != "" ~}
echo " SSL: Habilitado"
%{ else ~}
echo " SSL: Desabilitado (configure app_email para habilitar)"
%{ endif ~}
echo "=============================="

# Mostrar containers rodando
docker ps
