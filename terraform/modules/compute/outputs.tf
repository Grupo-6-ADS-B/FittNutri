output "instance_id" {
  description = "ID da instância EC2"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "IP público (Elastic IP)"
  value       = aws_eip.app.public_ip
}

output "private_ip" {
  description = "IP privado da EC2"
  value       = aws_instance.app.private_ip
}

output "eip_allocation_id" {
  description = "ID de alocação do Elastic IP"
  value       = aws_eip.app.id
}
