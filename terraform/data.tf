# AMI Ubuntu 22.04 mais recente (fallback se ami_id não for informado)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Identidade da conta AWS atual
data "aws_caller_identity" "current" {}

# Região atual
data "aws_region" "current" {}

# AZs disponíveis
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  # Se ami_id for vazio, usa Ubuntu 22.04 mais recente
  resolved_ami_id = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id

  # Nome do bucket S3: se não informado, gera um baseado no account ID
  resolved_s3_bucket = var.s3_bucket_name != "" ? var.s3_bucket_name : "${var.project}-${data.aws_caller_identity.current.account_id}-${var.environment}"

  # Tags comuns para passar aos módulos
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
