# ============================================================
# Security Groups segmentados por camada — principio do menor privilegio
# ALB  → App  → DB
#               → Monitoring (scrape)
# ============================================================

# ─── SG ALB (publico, recebe HTTP/HTTPS da internet) ───
resource "aws_security_group" "alb" {
  name_prefix = "${var.project}-alb-"
  description = "ALB publico - entrada HTTP/HTTPS da internet"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from internet (redirect para HTTPS)"
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
    description = "Egress - ALB encaminha para targets na VPC"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-alb-sg-${var.environment}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ─── SG App (EC2 aplicacao, recebe APENAS do ALB) ───
resource "aws_security_group" "app" {
  name_prefix = "${var.project}-app-"
  description = "EC2 App - recebe trafego apenas do ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "HTTP :8080 vindo apenas do ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Egress - ECR, S3 (via NAT), DB, MQ externo"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-app-sg-${var.environment}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ─── SG DB (MySQL, recebe APENAS do App) ───
resource "aws_security_group" "db" {
  name_prefix = "${var.project}-db-"
  description = "MySQL - recebe trafego apenas do App SG"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "MySQL :3306 vindo apenas do App"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Egress - apt/yum updates via NAT"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-db-sg-${var.environment}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ─── SG Monitoring (Prometheus scrape + Grafana via ALB) ───
resource "aws_security_group" "monitoring" {
  name_prefix = "${var.project}-monitoring-"
  description = "Prometheus + Grafana - scrape no App, painel via ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Grafana :3000 vindo apenas do ALB (/grafana/)"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Egress - scrape no App :8080/actuator/prometheus"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-monitoring-sg-${var.environment}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ─── Regra extra: App permite scrape vindo do Monitoring ───
resource "aws_security_group_rule" "app_accept_prometheus_scrape" {
  type                     = "ingress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  security_group_id        = aws_security_group.app.id
  source_security_group_id = aws_security_group.monitoring.id
  description              = "Scrape :8080/actuator/prometheus vindo do Monitoring"
}
