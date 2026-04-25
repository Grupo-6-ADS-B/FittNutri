output "alb_arn" {
  description = "ARN do Application Load Balancer"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "DNS name do Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Hosted zone ID do Application Load Balancer (para uso em alias records no Route 53)"
  value       = aws_lb.main.zone_id
}

output "app_target_group_arn" {
  description = "ARN do target group da aplicacao (porta 8080)"
  value       = aws_lb_target_group.app.arn
}

output "grafana_target_group_arn" {
  description = "ARN do target group do Grafana (porta 3000)"
  value       = aws_lb_target_group.grafana.arn
}
