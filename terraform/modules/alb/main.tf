resource "aws_lb" "main" {
  name               = "${var.project}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"

  security_groups = [var.alb_security_group_id]
  subnets         = var.public_subnet_ids

  enable_deletion_protection = false
  idle_timeout               = 60

  tags = merge(var.tags, {
    Name = "${var.project}-alb-${var.environment}"
  })
}

resource "aws_lb_target_group" "app" {
  name        = "${var.project}-app-tg-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  deregistration_delay = 30

  health_check {
    enabled             = true
    path                = var.app_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = merge(var.tags, {
    Name = "${var.project}-app-tg-${var.environment}"
  })
}

resource "aws_lb_target_group" "grafana" {
  name        = "${var.project}-grafana-tg-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = var.grafana_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = merge(var.tags, {
    Name = "${var.project}-grafana-tg-${var.environment}"
  })
}

# ─── Listener HTTP ───
# enable_https=false → forward direto para app TG
# enable_https=true  → redirect 301 para HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = var.enable_https ? "redirect" : "forward"
    target_group_arn = var.enable_https ? null : aws_lb_target_group.app.arn

    dynamic "redirect" {
      for_each = var.enable_https ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.environment}-http"
  })
}

# ─── Listener HTTPS (apenas quando enable_https = true) ───
resource "aws_lb_listener" "https" {
  count             = var.enable_https ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.environment}-https"
  })
}

# ─── Rule /grafana/* no listener HTTPS ───
resource "aws_lb_listener_rule" "grafana_https" {
  count        = var.enable_https ? 1 : 0
  listener_arn = aws_lb_listener.https[0].arn
  priority     = 100

  condition {
    path_pattern {
      values = ["/grafana", "/grafana/*"]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.environment}-grafana-https-rule"
  })
}

# ─── Rule /grafana/* no listener HTTP ───
resource "aws_lb_listener_rule" "grafana_http" {
  count        = var.enable_https ? 0 : 1
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  condition {
    path_pattern {
      values = ["/grafana", "/grafana/*"]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }

  tags = merge(var.tags, {
    Name = "${var.project}-${var.environment}-grafana-http-rule"
  })
}
