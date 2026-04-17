variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "domain_name" {
  description = "Dominio principal do certificado (ex: fittnutri.com.br)"
  type        = string
}

variable "subject_alternative_names" {
  description = "Dominios alternativos (ex: [\"*.fittnutri.com.br\"])"
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "ID da Hosted Zone para validacao DNS. Se vazio, a validacao e DNS_MANUAL (usuario cria o registro manualmente)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
