#!/bin/bash
# ============================================================
# FittNutri — Packer provisioner
# AMI enxuta: Docker + docker-compose + awscli + jq.
# Sem Nginx/Certbot — SSL e terminado no ALB.
# ============================================================

set -e

echo "=============================="
echo " Packer — Instalando runtime Docker"
echo "=============================="

while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
  echo "Aguardando apt..."
  sleep 5
done

sudo apt-get update -y
sudo apt-get upgrade -y

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

sudo apt-get install -y git awscli jq unattended-upgrades

# Limpeza para reduzir tamanho da AMI
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

echo "=============================="
echo " Packer — Setup concluido"
echo " Docker:  $(docker --version)"
echo " Compose: $(docker-compose --version)"
echo "=============================="
