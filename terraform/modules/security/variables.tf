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
  description = "CIDR block da VPC (usado para trafego interno da route table NAT)"
  type        = string
}

variable "alb_allowed_cidrs" {
  description = "CIDRs permitidos nas portas 80/443 do ALB (ex: [\"SEU.IP/32\"])"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
