variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "bucket_name" {
  description = "Nome do bucket S3 (globalmente único)"
  type        = string
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
