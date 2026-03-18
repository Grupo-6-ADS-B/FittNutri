# Compute Module — ALB, ASG, Launch Template, Target Groups

## Módulo Completo

```hcl
# modules/compute/variables.tf
variable "project" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "private_app_subnet_ids" { type = list(string) }
variable "app_sg_id" { type = string }
variable "alb_sg_id" { type = string }
variable "instance_type" { type = string; default = "t3.micro" }
variable "ami_id" { type = string }
variable "key_name" { type = string }
variable "iam_instance_profile_arn" { type = string }
variable "health_check_path" { type = string; default = "/" }
variable "min_size" { type = number; default = 1 }
variable "max_size" { type = number; default = 4 }
variable "desired_capacity" { type = number; default = 1 }
variable "user_data_base64" { type = string; default = "" }
variable "tags" { type = map(string); default = {} }
```

```hcl
# modules/compute/main.tf

# ─── ALB ───
resource "aws_lb" "main" {
  name               = "${var.project}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.project}-alb-${var.environment}"
  })
}

# ─── TARGET GROUP ───
resource "aws_lb_target_group" "app" {
  name     = "${var.project}-tg-${var.environment}"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    protocol            = "HTTP"
    port                = "traffic-port"
    path                = var.health_check_path
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-tg-${var.environment}"
  })
}

# ─── LISTENER HTTP ───
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# ─── LISTENER HTTPS (quando tiver certificado ACM) ───
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = 443
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
#   certificate_arn   = var.acm_certificate_arn
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.app.arn
#   }
# }

# ─── LAUNCH TEMPLATE ───
resource "aws_launch_template" "app" {
  name_prefix   = "${var.project}-lt-${var.environment}-"
  image_id      = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  iam_instance_profile {
    arn = var.iam_instance_profile_arn
  }

  vpc_security_group_ids = [var.app_sg_id]

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      delete_on_termination = true
      encrypted             = true
    }
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "optional"
    http_put_response_hop_limit = 2
  }

  user_data = var.user_data_base64

  tag_specifications {
    resource_type = "instance"
    tags = merge(var.tags, {
      Name = "${var.project}-app-${var.environment}"
    })
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ─── AUTO SCALING GROUP ───
resource "aws_autoscaling_group" "app" {
  name                = "${var.project}-asg-${var.environment}"
  desired_capacity    = var.desired_capacity
  min_size            = var.min_size
  max_size            = var.max_size
  vpc_zone_identifier = var.private_app_subnet_ids
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "${var.project}-app-${var.environment}"
    propagate_at_launch = true
  }
}

# ─── SCALING POLICY ───
resource "aws_autoscaling_policy" "cpu" {
  name                   = "${var.project}-cpu-scaling-${var.environment}"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 75.0
  }
}
```

```hcl
# modules/compute/outputs.tf
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "alb_arn" {
  value = aws_lb.main.arn
}

output "target_group_arn" {
  value = aws_lb_target_group.app.arn
}

output "asg_name" {
  value = aws_autoscaling_group.app.name
}

output "launch_template_id" {
  value = aws_launch_template.app.id
}
```

## User Data Pattern (Baked AMI)

A abordagem recomendada é AMI baked com systemd service. O User Data fica mínimo:

```bash
#!/bin/bash
# User Data mínimo — AMI já tem Docker + systemd service instalados
systemctl start fittnutri.service
```

O systemd service na AMI faz:
1. Login no ECR via IAM Role
2. Busca secrets do Secrets Manager
3. Gera docker-compose.yml com variáveis
4. docker-compose pull && up -d

```ini
# /etc/systemd/system/fittnutri.service (baked na AMI)
[Unit]
Description=FittNutri Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/opt/fittnutri/bootstrap.sh
ExecStop=/usr/local/bin/docker-compose -f /app/docker-compose.yml down

[Install]
WantedBy=multi-user.target
```

## Deploy de Novas Versões

Fluxo CI/CD para deploy sem downtime:

```bash
# 1. Build e push nova imagem pro ECR
docker build -t $ECR_URL/fittnutri-backend:latest .
docker push $ECR_URL/fittnutri-backend:latest

# 2. Trigger instance refresh no ASG
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name fittnutri-asg \
  --preferences '{"MinHealthyPercentage":50}'
```

Isso faz rolling update: novas instâncias sobem com a imagem nova, velhas são terminadas gradualmente.