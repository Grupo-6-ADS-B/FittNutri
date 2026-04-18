variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "ami_id" {
  description = "AMI base (fittnutri-docker-base ou Ubuntu 22.04)"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instancia"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Key Pair SSH"
  type        = string
}

variable "subnet_id" {
  description = "Subnet privada de DB"
  type        = string
}

variable "security_group_ids" {
  description = "SG do DB"
  type        = list(string)
}

variable "data_volume_size" {
  description = "Tamanho do volume EBS de dados (GB)"
  type        = number
  default     = 30
}

variable "data_volume_device" {
  description = "Device path do volume de dados"
  type        = string
  default     = "/dev/sdf"
}

variable "mysql_root_password" {
  description = "MYSQL_ROOT_PASSWORD (tambem exposto como senha do user root para o App). Passar via tfvars gitignorado ou TF_VAR_mysql_root_password."
  type        = string
  sensitive   = true
}

variable "mysql_database" {
  description = "Nome do schema inicial (MYSQL_DATABASE)"
  type        = string
  default     = "fittnutri"
}

variable "ebs_encrypted" {
  description = "Encriptar EBS"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags"
  type        = map(string)
  default     = {}
}
