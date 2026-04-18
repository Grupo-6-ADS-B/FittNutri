# ─── Aplicacao ───
output "app_url" {
  description = "URL publica da aplicacao (via ALB)"
  value       = var.enable_alb && var.acm_domain_name != "" ? "https://${var.acm_domain_name}" : (var.enable_alb ? "http://${module.alb[0].alb_dns_name}" : "(ALB desabilitado)")
}

output "alb_dns_name" {
  description = "DNS do ALB (apontar Route 53)"
  value       = var.enable_alb ? module.alb[0].alb_dns_name : "(ALB desabilitado)"
}

output "alb_zone_id" {
  description = "Zone ID do ALB para alias records"
  value       = var.enable_alb ? module.alb[0].alb_zone_id : ""
}

output "acm_certificate_arn" {
  description = "ARN do certificado ACM"
  value       = var.enable_alb ? module.acm[0].certificate_arn : ""
}

# ─── Compute ───
output "app_instance_id" {
  description = "ID da EC2 App"
  value       = module.compute.instance_id
}

output "app_private_ip" {
  description = "IP privado da EC2 App"
  value       = module.compute.private_ip
}

# ─── Database ───
output "db_private_ip" {
  description = "IP privado do MySQL (usar em DB_HOST)"
  value       = module.database.db_private_ip
}

output "db_volume_id" {
  description = "ID do volume EBS persistente do MySQL"
  value       = module.database.db_volume_id
}

# ─── Networking ───
output "vpc_id" {
  description = "ID da VPC"
  value       = module.networking.vpc_id
}

output "private_app_subnet_ids" {
  description = "IDs das subnets privadas de App"
  value       = module.networking.private_app_subnet_ids
}

# ─── Storage (condicional) ───
output "s3_bucket_name" {
  description = "Bucket S3 (vazio se desabilitado)"
  value       = var.enable_s3 ? module.storage[0].bucket_id : "(S3 desabilitado)"
}

# ─── Conta AWS ───
output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  value = data.aws_region.current.name
}
