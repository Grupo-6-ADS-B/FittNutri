# ─── Informações de Acesso ───
output "ec2_public_ip" {
  description = "IP público da EC2 (Elastic IP)"
  value       = module.compute.public_ip
}

output "ec2_instance_id" {
  description = "ID da instância EC2"
  value       = module.compute.instance_id
}

output "ssh_command" {
  description = "Comando SSH para acessar a EC2"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${module.compute.public_ip}"
}

output "app_url" {
  description = "URL da aplicação"
  value       = var.app_email != "" ? "https://${var.domain}" : "http://${module.compute.public_ip}"
}

# ─── Networking ───
output "vpc_id" {
  description = "ID da VPC"
  value       = module.networking.vpc_id
}

# ─── Storage (condicional) ───
output "s3_bucket_name" {
  description = "Nome do bucket S3 (vazio se S3 desabilitado)"
  value       = var.enable_s3 ? module.storage[0].bucket_id : "(S3 desabilitado)"
}

# ─── IAM (condicional) ───
output "iam_role_arn" {
  description = "ARN da IAM Role da EC2 (vazio se IAM desabilitado)"
  value       = var.enable_iam ? module.iam[0].role_arn : "(IAM desabilitado)"
}

# ─── Conta AWS ───
output "aws_account_id" {
  description = "ID da conta AWS em uso"
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "Região AWS em uso"
  value       = data.aws_region.current.name
}
