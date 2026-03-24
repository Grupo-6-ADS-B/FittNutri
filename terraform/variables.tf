# ─── Projeto ───
variable "project" {
  description = "Nome do projeto"
  type        = string
  default     = "fittnutri"
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

# ─── Networking ───
variable "vpc_cidr" {
  description = "CIDR block da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs das subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "azs" {
  description = "Availability Zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# ─── Compute ───
variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
  default     = "t3.small"
}

variable "ami_id" {
  description = "ID da AMI (baked ou Ubuntu base). Se vazio, usa data source para buscar Ubuntu 22.04 mais recente"
  type        = string
  default     = ""
}

variable "key_name" {
  description = "Nome do Key Pair para SSH (deve existir na conta AWS)"
  type        = string
}

variable "volume_size" {
  description = "Tamanho do EBS root em GB"
  type        = number
  default     = 20
}

# ─── Segurança ───
variable "ssh_allowed_cidrs" {
  description = "CIDRs permitidos para SSH (ex: seu IP/32)"
  type        = list(string)
  default     = []
}

# ─── Domínio ───
variable "domain" {
  description = "Domínio da aplicação"
  type        = string
  default     = "fittnutri.duckdns.org"
}

# ─── Aplicação ───
variable "git_repo" {
  description = "URL do repositório Git"
  type        = string
  default     = "https://github.com/Grupo-6-ADS-B/FittNutri.git"
}

variable "git_branch" {
  description = "Branch do Git para deploy"
  type        = string
  default     = "main"
}

variable "app_email" {
  description = "Email para certificado SSL (Let's Encrypt)"
  type        = string
  default     = ""
}

# ─── S3 ───
variable "s3_bucket_name" {
  description = "Nome do bucket S3 (deve ser globalmente único)"
  type        = string
  default     = ""
}

# ─── Flags de Resiliência (contas com restrições) ───
variable "enable_iam" {
  description = "Criar IAM Role/Instance Profile (false se a conta bloquear IAM)"
  type        = bool
  default     = true
}

variable "enable_s3" {
  description = "Criar bucket S3 (false se a conta bloquear S3 ou não precisar)"
  type        = bool
  default     = true
}

variable "enable_ebs_encryption" {
  description = "Encriptar volume EBS (false se a conta bloquear encryption)"
  type        = bool
  default     = true
}
