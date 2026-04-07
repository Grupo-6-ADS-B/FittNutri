#!/bin/bash
# ============================================================
# FittNutri — Terraform Apply
# Uso: ./scripts/apply.sh <pessoal|faculdade>
# ============================================================

set -e

CONTA=${1:?"Uso: $0 <pessoal|faculdade>"}
PLANFILE="tfplan-${CONTA}"

cd "$(dirname "$0")/.."

if [ ! -f "$PLANFILE" ]; then
  echo "Erro: plan file '$PLANFILE' não encontrado."
  echo "Execute primeiro: ./scripts/plan.sh $CONTA"
  exit 1
fi

echo "=============================="
echo " Terraform Apply — Conta: $CONTA"
echo "=============================="

terraform apply "$PLANFILE"

echo ""
echo "=============================="
echo " Apply concluído!"
echo "=============================="
terraform output
