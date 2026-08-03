#!/usr/bin/env bash
# ============================================================
# FittNutri — Pré-apply SSL (Let's Encrypt + DuckDNS + ACM)
#
# Uso:
#   ./scripts/pre-apply-ssl.sh <duckdns-token> <dominio> [conta] [regiao]
#
# Exemplo:
#   ./scripts/pre-apply-ssl.sh abc123 fittnutri.duckdns.org faculdade
#
# O que faz:
#   1. Instala certbot + plugin dns-duckdns (se necessário)
#   2. Gera certificado Let's Encrypt via DNS-01 (sem precisar abrir porta 80)
#   3. Importa o certificado no AWS ACM
#   4. Injeta enable_https e acm_certificate_arn no arquivo de conta informado
#
# Pré-requisitos:
#   - Python 3 + pip3 instalados
#   - AWS CLI configurado (aws configure ou variáveis de ambiente)
#   - Token DuckDNS (em duckdns.org → painel da conta)
# ============================================================

set -euo pipefail

# ─── Args ───────────────────────────────────────────────────
DUCKDNS_TOKEN="${1:-}"
DOMAIN="${2:-}"
CONTA="${3:-}"
REGION="${4:-us-east-1}"
EMAIL="lucasrodriguescartaxo250103@gmail.com"

# ─── Validação ──────────────────────────────────────────────
if [[ -z "$DUCKDNS_TOKEN" || -z "$DOMAIN" ]]; then
  echo ""
  echo "Uso: $0 <duckdns-token> <dominio> [conta] [regiao]"
  echo ""
  echo "  duckdns-token  Token do seu painel em duckdns.org"
  echo "  dominio        Ex: fittnutri.duckdns.org"
  echo "  conta          Nome do arquivo tfvars em contas/ (opcional)"
  echo "  regiao         Região AWS (default: us-east-1)"
  echo ""
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TERRAFORM_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "=============================================="
echo " FittNutri — Pre-apply SSL"
echo " Domínio : $DOMAIN"
echo " Região  : $REGION"
echo "=============================================="
echo ""

# ─── 1. Instalar dependências ────────────────────────────────
echo "[1/4] Verificando certbot + plugin DuckDNS..."
if ! command -v certbot &>/dev/null; then
  echo "      Instalando certbot..."
  pip3 install --quiet certbot
fi

if ! pip3 show certbot-dns-duckdns &>/dev/null; then
  echo "      Instalando certbot-dns-duckdns..."
  pip3 install --quiet certbot-dns-duckdns
fi
echo "      OK"

# ─── 2. Arquivo de credenciais DuckDNS (temporário) ─────────
CREDS_FILE=$(mktemp /tmp/duckdns-creds-XXXXXX.ini)
chmod 600 "$CREDS_FILE"
echo "dns_duckdns_token = $DUCKDNS_TOKEN" > "$CREDS_FILE"
trap 'rm -f "$CREDS_FILE"' EXIT

# ─── 3. Gerar certificado Let's Encrypt ─────────────────────
echo "[2/4] Gerando certificado Let's Encrypt via DuckDNS DNS-01..."
echo "      (aguarda ~60s para propagação DNS)"

CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

# Se já existe, renova; senão gera do zero
if [ -d "$CERT_DIR" ]; then
  echo "      Certificado existente encontrado — renovando..."
  certbot renew \
    --authenticator dns-duckdns \
    --dns-duckdns-credentials "$CREDS_FILE" \
    --dns-duckdns-propagation-seconds 60 \
    --cert-name "$DOMAIN" \
    --non-interactive \
    2>&1 | tail -5
else
  certbot certonly \
    --authenticator dns-duckdns \
    --dns-duckdns-credentials "$CREDS_FILE" \
    --dns-duckdns-propagation-seconds 60 \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    -m "$EMAIL" \
    2>&1 | tail -10
fi
echo "      OK — certificado em $CERT_DIR"

# ─── 4. Importar no ACM ──────────────────────────────────────
echo "[3/4] Importando certificado no AWS ACM (região: $REGION)..."

# Verifica se já existe um cert para este domínio no ACM (para sobrescrever)
EXISTING_ARN=$(aws acm list-certificates \
  --region "$REGION" \
  --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" \
  --output text 2>/dev/null || echo "")

if [[ -n "$EXISTING_ARN" ]]; then
  echo "      Certificado existente no ACM ($EXISTING_ARN) — substituindo..."
  CERT_ARN=$(aws acm import-certificate \
    --certificate-arn "$EXISTING_ARN" \
    --certificate "file://$CERT_DIR/cert.pem" \
    --private-key "file://$CERT_DIR/privkey.pem" \
    --certificate-chain "file://$CERT_DIR/fullchain.pem" \
    --region "$REGION" \
    --query CertificateArn \
    --output text)
else
  CERT_ARN=$(aws acm import-certificate \
    --certificate "file://$CERT_DIR/cert.pem" \
    --private-key "file://$CERT_DIR/privkey.pem" \
    --certificate-chain "file://$CERT_DIR/fullchain.pem" \
    --region "$REGION" \
    --query CertificateArn \
    --output text)
fi
echo "      OK — ARN: $CERT_ARN"

# ─── 5. Injetar no arquivo de conta (opcional) ───────────────
if [[ -n "$CONTA" ]]; then
  TFVARS_FILE="$TERRAFORM_DIR/contas/${CONTA}.tfvars"
  if [[ -f "$TFVARS_FILE" ]]; then
    echo "[4/4] Injetando variáveis em $TFVARS_FILE..."

    # Atualiza enable_https
    if grep -q "^enable_https" "$TFVARS_FILE"; then
      sed -i 's|^enable_https.*|enable_https = true|' "$TFVARS_FILE"
    else
      echo 'enable_https = true' >> "$TFVARS_FILE"
    fi

    # Atualiza acm_certificate_arn
    if grep -q "^acm_certificate_arn" "$TFVARS_FILE"; then
      sed -i "s|^acm_certificate_arn.*|acm_certificate_arn = \"$CERT_ARN\"|" "$TFVARS_FILE"
    else
      echo "acm_certificate_arn = \"$CERT_ARN\"" >> "$TFVARS_FILE"
    fi

    # Atualiza acm_domain_name
    if grep -q "^acm_domain_name" "$TFVARS_FILE"; then
      sed -i "s|^acm_domain_name.*|acm_domain_name = \"$DOMAIN\"|" "$TFVARS_FILE"
    else
      echo "acm_domain_name = \"$DOMAIN\"" >> "$TFVARS_FILE"
    fi

    echo "      OK — $TFVARS_FILE atualizado"
  else
    echo "[4/4] Arquivo $TFVARS_FILE não encontrado — pulando injeção automática"
  fi
else
  echo "[4/4] Conta não informada — adicione manualmente ao seu tfvars:"
fi

# ─── Resultado ───────────────────────────────────────────────
echo ""
echo "=============================================="
echo " Concluído!"
echo "=============================================="
echo ""
echo " Adicione ao seu tfvars (se não foi injetado):"
echo ""
echo "   enable_https        = true"
echo "   acm_domain_name     = \"$DOMAIN\""
echo "   acm_certificate_arn = \"$CERT_ARN\""
echo ""
echo " Após o apply, aponte seu DuckDNS:"
echo "   Em duckdns.org → seu subdomínio → CNAME → <alb_dns_name>"
echo "   (terraform output alb_dns_name)"
echo ""
echo " Certificado expira em 90 dias. Para renovar:"
echo "   ./scripts/pre-apply-ssl.sh $DUCKDNS_TOKEN $DOMAIN $CONTA"
echo ""
