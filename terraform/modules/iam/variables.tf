variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN do bucket S3 para policy restritiva"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
