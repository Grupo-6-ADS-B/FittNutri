output "certificate_arn" {
  description = "ARN do certificado ACM (pendente se validacao DNS nao concluida)"
  value       = aws_acm_certificate.main.arn
}

output "validation_records" {
  description = "Registros DNS para validar manualmente caso route53_zone_id nao informado"
  value       = aws_acm_certificate.main.domain_validation_options
}
