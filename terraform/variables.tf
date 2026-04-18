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

# ─── Networking privado ───
variable "private_app_subnet_cidrs" {
  description = "CIDRs das subnets privadas de aplicacao"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDRs das subnets privadas de banco"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "private_monitoring_subnet_cidrs" {
  description = "CIDRs das subnets privadas de monitoramento"
  type        = list(string)
  default     = ["10.0.30.0/24"]
}

variable "enable_nat_gateway" {
  description = "Habilita NAT Gateway (necessario para subnets privadas acessarem ECR/S3/apt)"
  type        = bool
  default     = true
}

# ─── ALB / ACM ───
variable "acm_domain_name" {
  description = "Dominio principal do certificado ACM (ex: fittnutri.com.br)"
  type        = string
  default     = ""
}

variable "acm_subject_alternative_names" {
  description = "SANs adicionais do certificado ACM"
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "Hosted Zone ID para validacao automatica do ACM (vazio = validacao manual)"
  type        = string
  default     = ""
}

variable "enable_alb" {
  description = "Provisiona ALB + ACM. Defina false em laboratorios que nao queiram pagar ALB"
  type        = bool
  default     = true
}

# ─── Database ───
variable "db_instance_type" {
  description = "Tipo da EC2 do MySQL"
  type        = string
  default     = "t3.small"
}

variable "db_data_volume_size" {
  description = "Tamanho do volume EBS dedicado ao MySQL (GB)"
  type        = number
  default     = 30
}

# ─── Aplicacao (.env) — SENSIVEL: preencher via contas/<conta>.tfvars gitignorado ou TF_VAR_* ───
variable "app_db_password" {
  description = "Senha do MySQL (compartilhada entre MYSQL_ROOT_PASSWORD e SPRING_DATASOURCE_PASSWORD)"
  type        = string
  sensitive   = true
}

variable "app_jwt_secret" {
  description = "JWT_SECRET usado pelo backend"
  type        = string
  sensitive   = true
}

variable "app_aes_key" {
  description = "APP_AES_KEY (base64, simetrica)"
  type        = string
  sensitive   = true
}

variable "app_jwt_validity" {
  description = "JWT_VALIDITY (milissegundos)"
  type        = number
  default     = 3600000
}

variable "app_rabbitmq_url" {
  description = "RABBITMQ_URL — AMQPS endpoint (CloudAMQP)"
  type        = string
  sensitive   = true
}

variable "app_s3_bucket" {
  description = "Nome do bucket S3 para PDFs (se enable_s3 for true, pode ser derivado de local.resolved_s3_bucket)"
  type        = string
  default     = ""
}

variable "app_spring_profile" {
  description = "SPRING_PROFILES_ACTIVE"
  type        = string
  default     = "prod"
}

# ─── Monitoring ───
variable "enable_monitoring" {
  description = "Provisiona EC2 de monitoramento (Prometheus + Grafana)"
  type        = bool
  default     = true
}

variable "grafana_admin_user" {
  description = "GRAFANA_ADMIN_USER"
  type        = string
  default     = "admin"
}

variable "grafana_admin_password" {
  description = "GRAFANA_ADMIN_PASSWORD"
  type        = string
  sensitive   = true
}
