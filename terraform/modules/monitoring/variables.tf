variable "project" {
  type = string
}
variable "environment" {
  type = string
}
variable "ami_id" {
  type = string
}
variable "instance_type" {
  type    = string
  default = "t3.micro"
}
variable "key_name" {
  type = string
}
variable "subnet_id" {
  description = "Subnet privada de monitoring"
  type        = string
}
variable "security_group_ids" {
  type = list(string)
}
variable "ebs_encrypted" {
  type    = bool
  default = true
}
variable "app_private_ip" {
  description = "IP privado da EC2 App (target do scrape Prometheus)"
  type        = string
}
variable "grafana_admin_user" {
  type    = string
  default = "admin"
}
variable "grafana_admin_password" {
  type      = string
  sensitive = true
}
variable "register_with_alb" {
  description = "Se true, registra a EC2 Grafana no target group do ALB"
  type        = bool
  default     = false
}

variable "grafana_target_group_arn" {
  description = "ARN do target group /grafana/* no ALB (usado quando register_with_alb=true)"
  type        = string
  default     = ""
}
variable "iam_instance_profile" {
  description = "Instance profile para SSM/CloudWatch (vazio = sem profile)"
  type        = string
  default     = ""
}
variable "fittnutri_dashboard_json" {
  description = "Conteúdo do dashboard FittNutri em base64 para provisionamento automático"
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
