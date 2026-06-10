# ─── S3 BUCKET ───
resource "aws_s3_bucket" "main" {
  bucket = var.bucket_name

  tags = merge(var.tags, {
    Name = "${var.project}-bucket-${var.environment}"
  })
}

# ─── VERSIONAMENTO ───
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = "Enabled"
  }
}

# ─── ENCRIPTAÇÃO SSE-S3 ───
resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# ─── BLOQUEAR ACESSO PÚBLICO ───
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
