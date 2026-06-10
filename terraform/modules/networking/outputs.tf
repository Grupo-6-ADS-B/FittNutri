output "vpc_id" {
  description = "ID da VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block da VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = aws_subnet.public[*].id
}

output "internet_gateway_id" {
  description = "ID do Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "private_app_subnet_ids" {
  description = "IDs das subnets privadas de aplicacao"
  value       = aws_subnet.private_app[*].id
}

output "private_db_subnet_ids" {
  description = "IDs das subnets privadas de banco de dados"
  value       = aws_subnet.private_db[*].id
}

output "private_monitoring_subnet_ids" {
  description = "IDs das subnets privadas de monitoramento"
  value       = aws_subnet.private_monitoring[*].id
}

output "nat_gateway_id" {
  description = "ID do NAT Gateway (vazio se desabilitado)"
  value       = var.enable_nat_gateway ? aws_nat_gateway.main[0].id : ""
}
