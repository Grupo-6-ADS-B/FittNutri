output "instance_id" {
  description = "ID da instância EC2"
  value       = aws_instance.app.id
}

output "private_ip" {
  description = "IP privado da EC2"
  value       = aws_instance.app.private_ip
}
