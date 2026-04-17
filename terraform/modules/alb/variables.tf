variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de deploy (ex: prod, staging)"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC onde o ALB sera criado"
  type        = string
}

variable "public_subnet_ids" {
  description = "Lista de IDs das subnets publicas para o ALB"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ID do Security Group associado ao ALB"
  type        = string
}

variable "certificate_arn" {
  description = "ARN do certificado ACM para o listener HTTPS"
  type        = string
}

variable "app_health_check_path" {
  description = "Caminho de health check para o target group da aplicacao"
  type        = string
  default     = "/actuator/health"
}

variable "grafana_health_check_path" {
  description = "Caminho de health check para o target group do Grafana"
  type        = string
  default     = "/api/health"
}

variable "tags" {
  description = "Tags a serem aplicadas nos recursos"
  type        = map(string)
  default     = {}
}
