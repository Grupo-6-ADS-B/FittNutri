# Database Module — RDS MySQL

```hcl
# modules/database/main.tf

resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db-subnet-${var.environment}"
  subnet_ids = var.private_db_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.project}-db-subnet-${var.environment}"
  })
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project}-db-${var.environment}"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.instance_class

  allocated_storage     = var.storage_gb
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.database_name
  username = var.master_username
  password = var.master_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.db_sg_id]

  multi_az            = var.multi_az
  publicly_accessible = false
  skip_final_snapshot = var.environment != "prod"

  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  tags = merge(var.tags, {
    Name = "${var.project}-db-${var.environment}"
  })
}
```

```hcl
# modules/database/variables.tf
variable "project" { type = string }
variable "environment" { type = string }
variable "private_db_subnet_ids" { type = list(string) }
variable "db_sg_id" { type = string }
variable "instance_class" { type = string; default = "db.t3.micro" }
variable "storage_gb" { type = number; default = 20 }
variable "database_name" { type = string }
variable "master_username" { type = string }
variable "master_password" { type = string; sensitive = true }
variable "multi_az" { type = bool; default = false }
variable "tags" { type = map(string); default = {} }
```

## Notas

- **RDS STOPPED**: RDS pode ficar stopped por até 7 dias, depois a AWS liga automaticamente.
- **Custo**: db.t3.micro ~$15/mês (on-demand). Usar Reserved Instance pra produção.
- **Senha**: Usar `random_password` + Secrets Manager em vez de hardcode.
- **Schema**: Aplicar migrations via Flyway/Liquibase no boot da aplicação.