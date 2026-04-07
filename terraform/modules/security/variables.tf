variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block da VPC"
  type        = string
}

variable "ssh_allowed_cidrs" {
  description = "CIDRs permitidos para SSH"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
