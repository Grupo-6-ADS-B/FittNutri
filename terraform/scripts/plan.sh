#!/bin/bash
# ============================================================
# FittNutri — Terraform Plan
# Uso: ./scripts/plan.sh <pessoal|faculdade>
# ============================================================

set -e

CONTA=${1:?"Uso: $0 <pessoal|faculdade>"}
TFVARS="contas/${CONTA}.tfvars"

cd "$(dirname "$0")/.."

if [ ! -f "$TFVARS" ]; then
  echo "Erro: arquivo $TFVARS não encontrado."
  echo "Contas disponíveis:"
  ls contas/*.tfvars 2>/dev/null | sed 's|contas/||;s|\.tfvars||'
  exit 1
fi

echo "=============================="
echo " Terraform Plan — Conta: $CONTA"
echo "=============================="

terraform init -upgrade
terraform fmt -check || echo "AVISO: Arquivos não formatados. Execute 'terraform fmt'"
terraform validate
terraform plan -var-file="$TFVARS" -out="tfplan-${CONTA}"

echo ""
echo "Plan salvo em: tfplan-${CONTA}"
echo "Para aplicar: ./scripts/apply.sh $CONTA"
