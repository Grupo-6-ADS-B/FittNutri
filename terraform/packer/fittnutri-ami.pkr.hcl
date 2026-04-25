packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# ─── Variáveis ───
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

# ─── Source AMI (Ubuntu 22.04) ───
source "amazon-ebs" "fittnutri" {
  ami_name        = "fittnutri-docker-base-{{timestamp}}"
  ami_description = "FittNutri AMI base — Ubuntu 22.04 + Docker + docker-compose + awscli (sem Nginx/Certbot)"
  instance_type   = var.instance_type
  region          = var.aws_region
  ssh_username    = "ubuntu"

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"]
    most_recent = true
  }

  tags = {
    Name      = "fittnutri-docker-base"
    Project   = "fittnutri"
    ManagedBy = "packer"
    Layer     = "base"
    BuildDate = "{{timestamp}}"
  }
}

# ─── Build ───
build {
  sources = ["source.amazon-ebs.fittnutri"]

  provisioner "shell" {
    script = "scripts/setup.sh"
  }
}
