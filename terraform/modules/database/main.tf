# ============================================================
# Database — MySQL 8.0 em EC2 dedicada (sem RDS)
# Volume EBS separado, persistente, bind-mount no container.
# ============================================================

resource "aws_instance" "db" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  associate_public_ip_address = false

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
    data_device         = var.data_volume_device
    mysql_root_password = var.mysql_root_password
    mysql_database      = var.mysql_database
  })

  tags = merge(var.tags, {
    Name = "${var.project}-db-ec2-${var.environment}"
    Role = "mysql"
  })

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# ─── Volume EBS persistente (dados MySQL) ───
resource "aws_ebs_volume" "mysql_data" {
  availability_zone = aws_instance.db.availability_zone
  size              = var.data_volume_size
  type              = "gp3"
  encrypted         = var.ebs_encrypted

  tags = merge(var.tags, {
    Name = "${var.project}-db-data-${var.environment}"
  })

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_volume_attachment" "mysql_data" {
  device_name = var.data_volume_device
  volume_id   = aws_ebs_volume.mysql_data.id
  instance_id = aws_instance.db.id
}
