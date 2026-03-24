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
