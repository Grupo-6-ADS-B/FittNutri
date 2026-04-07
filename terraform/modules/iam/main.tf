# ─── IAM ROLE PARA EC2 ───
resource "aws_iam_role" "ec2" {
  name = "${var.project}-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = merge(var.tags, {
    Name = "${var.project}-ec2-role-${var.environment}"
  })
}

# ─── POLICIES GERENCIADAS ───

# SSM — acesso via Session Manager (alternativa ao SSH)
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# CloudWatch — logs e métricas
resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# ─── POLICY INLINE: S3 (RESTRITA AO BUCKET) ───
resource "aws_iam_role_policy" "s3" {
  count = var.s3_bucket_arn != "" ? 1 : 0
  name  = "${var.project}-s3-access-${var.environment}"
  role  = aws_iam_role.ec2.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      }
    ]
  })
}

# ─── POLICY INLINE: SECRETS MANAGER (RESTRITA AO PREFIX) ───
resource "aws_iam_role_policy" "secrets" {
  name = "${var.project}-secrets-access-${var.environment}"
  role = aws_iam_role.ec2.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerAccess"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:${var.project}/*"
      }
    ]
  })
}

# ─── INSTANCE PROFILE ───
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project}-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2.name

  tags = merge(var.tags, {
    Name = "${var.project}-ec2-profile-${var.environment}"
  })
}
