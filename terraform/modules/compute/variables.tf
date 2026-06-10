variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "ami_id" {
  description = "ID da AMI para a EC2"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Nome do Key Pair"
  type        = string
}

variable "subnet_id" {
  description = "ID da subnet onde a EC2 será criada"
  type        = string
}

variable "security_group_ids" {
  description = "IDs dos Security Groups"
  type        = list(string)
}

variable "iam_instance_profile" {
  description = "Nome do IAM Instance Profile (vazio se IAM desabilitado)"
  type        = string
  default     = ""
}

variable "ebs_encrypted" {
  description = "Encriptar volume EBS root"
  type        = bool
  default     = true
}

variable "volume_size" {
  description = "Tamanho do EBS root em GB"
  type        = number
  default     = 20
}

variable "user_data" {
  description = "Script de User Data (base64)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}

# ─── ALB TARGET GROUP ───
variable "register_with_alb" {
  description = "Se true, registra a EC2 no target group do ALB"
  type        = bool
  default     = false
}

variable "target_group_arn" {
  description = "ARN do Target Group do ALB (usado quando register_with_alb=true)"
  type        = string
  default     = ""
}

variable "target_group_port" {
  description = "Porta do Target Group para health-check"
  type        = number
  default     = 8080
}

# ─── VARIÁVEIS DE APLICAÇÃO ───
variable "app_frontend_url" {
  description = "URL pública do frontend"
  type        = string
  default     = ""
}

variable "app_db_host" {
  description = "Host do banco de dados RDS"
  type        = string
  default     = ""
}

variable "app_db_port" {
  description = "Porta do banco de dados"
  type        = number
  default     = 3306
}

variable "app_db_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = ""
}

variable "app_db_username" {
  description = "Usuário do banco de dados"
  type        = string
  default     = ""
}

variable "app_db_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
  default     = ""
}

variable "app_jwt_secret" {
  description = "Segredo JWT"
  type        = string
  sensitive   = true
  default     = ""
}

variable "app_jwt_validity" {
  description = "Validade do token JWT (ms)"
  type        = string
  default     = "86400000"
}

variable "app_aes_key" {
  description = "Chave AES para criptografia"
  type        = string
  sensitive   = true
  default     = ""
}

variable "app_rabbitmq_url" {
  description = "URL de conexão do RabbitMQ/AmazonMQ"
  type        = string
  sensitive   = true
  default     = ""
}

variable "app_s3_bucket" {
  description = "Nome do bucket S3"
  type        = string
  default     = ""
}

variable "app_spring_profile" {
  description = "Profile Spring ativo (local, prod)"
  type        = string
  default     = "prod"
}
