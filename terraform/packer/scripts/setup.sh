#!/bin/bash
# ============================================================
# FittNutri — Packer Provisioner
# Instala Docker, docker-compose, Git e AWS CLI na AMI
# ============================================================

set -e

echo "=============================="
echo " Packer — Instalando dependências"
echo "=============================="

# Aguardar apt estar disponível (cloud-init pode estar rodando)
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
  echo "Aguardando apt ficar disponível..."
  sleep 5
done

# Atualizar sistema
sudo apt-get update -y
sudo apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Instalar docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Git e utilitários
sudo apt-get install -y git awscli jq

# Criar diretório da aplicação
sudo mkdir -p /home/ubuntu/FittNutri
sudo chown ubuntu:ubuntu /home/ubuntu/FittNutri

# Limpar cache APT (reduz tamanho da AMI)
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

echo "=============================="
echo " Packer — Setup concluído!"
echo " Docker: $(docker --version)"
echo " Compose: $(docker-compose --version)"
echo " Git: $(git --version)"
echo "=============================="
