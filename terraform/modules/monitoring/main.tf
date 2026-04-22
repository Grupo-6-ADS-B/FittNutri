# ============================================================
# Monitoring — Prometheus + Grafana em EC2 privada dedicada
# ============================================================

resource "aws_instance" "monitoring" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  associate_public_ip_address = false
  iam_instance_profile        = var.iam_instance_profile != "" ? var.iam_instance_profile : null

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = var.ebs_encrypted
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data = templatefile("${path.module}/user-data.sh.tpl", {
    app_private_ip           = var.app_private_ip
    grafana_admin_user       = var.grafana_admin_user
    grafana_admin_password   = var.grafana_admin_password
    fittnutri_dashboard_json = var.fittnutri_dashboard_json
  })

  tags = merge(var.tags, {
    Name = "${var.project}-monitoring-ec2-${var.environment}"
    Role = "monitoring"
  })

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

resource "aws_lb_target_group_attachment" "grafana" {
  count            = var.register_with_alb ? 1 : 0
  target_group_arn = var.grafana_target_group_arn
  target_id        = aws_instance.monitoring.id
  port             = 3000
}
