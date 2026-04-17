# ─── EC2 INSTANCE ───
resource "aws_instance" "app" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  associate_public_ip_address = false
  iam_instance_profile        = var.iam_instance_profile != "" ? var.iam_instance_profile : null

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = var.ebs_encrypted
    delete_on_termination = true
  }

  # IMDSv2 obrigatório — previne SSRF (OWASP A10)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data = var.user_data

  tags = merge(var.tags, {
    Name = "${var.project}-ec2-${var.environment}"
  })

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# ─── ALB TARGET GROUP ATTACHMENT ───
resource "aws_lb_target_group_attachment" "app" {
  count            = var.target_group_arn != "" ? 1 : 0
  target_group_arn = var.target_group_arn
  target_id        = aws_instance.app.id
  port             = var.target_group_port
}
