#!/bin/bash
# ============================================================
# FittNutri — Terraform Destroy
# Uso: ./scripts/destroy.sh <pessoal|faculdade>
# ============================================================

set -e

CONTA=${1:?"Uso: $0 <pessoal|faculdade>"}
TFVARS="contas/${CONTA}.tfvars"

cd "$(dirname "$0")/.."

if [ ! -f "$TFVARS" ]; then
  echo "Erro: arquivo $TFVARS não encontrado."
  exit 1
fi

echo "=============================="
echo " Terraform Destroy — Conta: $CONTA"
echo " ATENÇÃO: Isso vai destruir TODOS os recursos!"
echo "=============================="

terraform destroy -var-file="$TFVARS"
