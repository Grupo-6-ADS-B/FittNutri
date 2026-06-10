# AMI Ubuntu 22.04 — comentado para terraform destroy (ec2:DescribeImages bloqueado no Academy)
# data "aws_ami" "ubuntu" {
#   most_recent = true
#   owners      = ["099720109477"] # Canonical
#   filter {
#     name   = "name"
#     values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
#   }
#   filter {
#     name   = "virtualization-type"
#     values = ["hvm"]
#   }
# }

# Identidade da conta AWS atual
data "aws_caller_identity" "current" {}

# Região atual
data "aws_region" "current" {}

# AZs disponíveis — comentado para terraform destroy (ec2:DescribeAvailabilityZones bloqueado no Academy)
# data "aws_availability_zones" "available" {
#   state = "available"
# }

locals {
  # AMI hardcoded para destroy (data source bloqueado no Academy)
  resolved_ami_id = var.ami_id != "" ? var.ami_id : "ami-0c7217cdde317cfec" # Ubuntu 22.04 us-east-1

  # Nome do bucket S3: se não informado, gera um baseado no account ID
  resolved_s3_bucket = var.s3_bucket_name != "" ? var.s3_bucket_name : "${var.project}-${data.aws_caller_identity.current.account_id}-${var.environment}"

  # Tags comuns para passar aos módulos
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
