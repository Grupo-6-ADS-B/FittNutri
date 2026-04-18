output "db_instance_id" {
  description = "ID da EC2 MySQL"
  value       = aws_instance.db.id
}

output "db_private_ip" {
  description = "IP privado do MySQL (usar no .env da App)"
  value       = aws_instance.db.private_ip
}

output "db_volume_id" {
  description = "ID do volume EBS de dados (persistente)"
  value       = aws_ebs_volume.mysql_data.id
}
