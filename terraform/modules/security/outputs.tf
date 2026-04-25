output "alb_sg_id" {
  description = "ID do Security Group do ALB"
  value       = aws_security_group.alb.id
}

output "app_sg_id" {
  description = "ID do Security Group da EC2 App"
  value       = aws_security_group.app.id
}

output "db_sg_id" {
  description = "ID do Security Group do MySQL"
  value       = aws_security_group.db.id
}

output "monitoring_sg_id" {
  description = "ID do Security Group de Prometheus/Grafana"
  value       = aws_security_group.monitoring.id
}
