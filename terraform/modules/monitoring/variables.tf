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
variable "grafana_target_group_arn" {
  description = "ARN do target group /grafana/* no ALB (vazio se ALB desabilitado)"
  type        = string
  default     = ""
}
variable "tags" {
  type    = map(string)
  default = {}
}
