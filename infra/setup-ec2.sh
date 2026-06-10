#!/bin/bash
# ============================================================
# FittNutri — Script de configuração da EC2 (Ubuntu 22.04)
# Uso: bash infra/setup-ec2.sh <seu-email> <branch>
# Exemplo: bash infra/setup-ec2.sh eu@email.com claude
# ============================================================

set -e

EMAIL=${1:-""}
BRANCH=${2:-"claude"}
REPO="https://github.com/Grupo-6-ADS-B/FittNutri.git"
DOMAIN="fittnutri.duckdns.org"
APP_DIR="$HOME/FittNutri"

if [ -z "$EMAIL" ]; then
  echo "Erro: informe o e-mail para o certificado SSL."
  echo "Uso: bash infra/setup-ec2.sh <seu-email> [branch]"
  exit 1
fi

echo "=============================="
echo " FittNutri — Setup EC2"
echo "=============================="

# --- 1. Atualizar sistema ---
echo "[1/7] Atualizando sistema..."
sudo apt-get update -y && sudo apt-get upgrade -y

# --- 2. Instalar Docker ---
echo "[2/7] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "Docker instalado. Reiniciando sessão do grupo..."
else
  echo "Docker já instalado."
fi

# --- 3. Instalar docker-compose ---
echo "[3/7] Instalando docker-compose..."
if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
else
  echo "docker-compose já instalado."
fi

# --- 4. Instalar Git ---
echo "[4/7] Instalando Git..."
sudo apt-get install -y git

# --- 5. Clonar repositório ---
echo "[5/7] Clonando repositório..."
if [ -d "$APP_DIR" ]; then
  echo "Diretório $APP_DIR já existe. Fazendo pull..."
  cd "$APP_DIR" && git fetch origin && git checkout "$BRANCH" && git pull origin "$BRANCH"
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
  git checkout "$BRANCH"
fi

cd "$APP_DIR"

# --- 6. Criar .env ---
echo "[6/7] Configurando .env..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "ATENÇÃO: Arquivo .env criado a partir do .env.example."
  echo "Edite o arquivo agora com seus valores reais:"
  echo "  nano $APP_DIR/.env"
  echo ""
  echo "Pressione ENTER quando o .env estiver preenchido..."
  read -r
else
  echo ".env já existe, pulando."
fi

# --- 7. Emitir certificado SSL ---
echo "[7/7] Emitindo certificado SSL para $DOMAIN..."

# Habilitar apenas HTTP temporariamente (comenta bloco 443)
NGINX_CONF="nginx/conf.d/fittnutri.conf"
cp "$NGINX_CONF" "${NGINX_CONF}.bak"
# Comenta o bloco server 443
awk '/listen 443 ssl/{found=1} found && /^server \{/{if(started){print "#"$0; next} started=1} {print}' "$NGINX_CONF" > /tmp/nginx_tmp.conf || true

# Sobe só o nginx em HTTP
sg docker -c "docker-compose --env-file .env up -d nginx" 2>/dev/null || \
  docker-compose --env-file .env up -d nginx

sleep 3

# Emite o certificado
sg docker -c "docker-compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d $DOMAIN \
  --email $EMAIL --agree-tos --no-eff-email --non-interactive" 2>/dev/null || \
  docker-compose run --rm certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" --agree-tos --no-eff-email --non-interactive

echo ""
echo "=============================="
echo " Certificado SSL obtido!"
echo " Iniciando aplicação completa..."
echo "=============================="

# Build e start completo
sg docker -c "bash manage.sh build && bash manage.sh start" 2>/dev/null || \
  (bash manage.sh build && bash manage.sh start)

echo ""
echo "=============================="
echo " Deploy concluído!"
echo " Acesse: https://$DOMAIN"
echo "=============================="
docker ps
