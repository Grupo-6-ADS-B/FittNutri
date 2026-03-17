# Security Module — Security Groups, IAM Roles

## Security Groups

```hcl
# modules/security/main.tf

# ─── ALB SG ───
resource "aws_security_group" "alb" {
  name_prefix = "${var.project}-alb-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from internet"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project}-alb-sg-${var.environment}"
  })
}

# ─── APP SG ───
resource "aws_security_group" "app" {
  name_prefix = "${var.project}-app-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "HTTP from ALB"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "HTTPS for VPC Endpoints"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "SSH from VPC (EICE)"
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All TCP outbound"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-app-sg-${var.environment}"
  })
}

# ─── DB SG ───
resource "aws_security_group" "db" {
  name_prefix = "${var.project}-db-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "MySQL from App"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project}-db-sg-${var.environment}"
  })
}

# ─── MQ SG ───
resource "aws_security_group" "mq" {
  name_prefix = "${var.project}-mq-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5671
    to_port         = 5671
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "AMQPS from App"
  }

  ingress {
    from_port       = 15672
    to_port         = 15672
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "RabbitMQ Management from App"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project}-mq-sg-${var.environment}"
  })
}

# ─── VPCE SG (DEDICADO - CRÍTICO) ───
resource "aws_security_group" "vpce" {
  name_prefix = "${var.project}-vpce-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "HTTPS from entire VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project}-vpce-sg-${var.environment}"
  })
}
```

## IAM Role para EC2

```hcl
# modules/iam/main.tf

resource "aws_iam_role" "ec2" {
  name = "${var.project}-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = var.tags
}

# Políticas gerenciadas
resource "aws_iam_role_policy_attachment" "policies" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy",
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/SecretsManagerReadWrite",
  ])

  role       = aws_iam_role.ec2.name
  policy_arn = each.value
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project}-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2.name
}
```

## Regras de Ouro para Security Groups

1. **SG de VPCE SEMPRE dedicado** — nunca reutilizar o SG das instâncias
2. **Referência por SG, não por CIDR** entre componentes internos (ALB→App, App→DB)
3. **Egress restrito** quando possível (app só precisa de TCP outbound)
4. **SSH apenas do VPC CIDR** — acesso via EICE, nunca 0.0.0.0/0
5. **Description em todas as regras** — facilita auditoria