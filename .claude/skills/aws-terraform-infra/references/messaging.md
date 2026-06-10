# Messaging Module — Amazon MQ (RabbitMQ)

```hcl
# modules/messaging/main.tf

resource "aws_mq_broker" "rabbitmq" {
  broker_name = "${var.project}-mq-${var.environment}"

  engine_type        = "RabbitMQ"
  engine_version     = "3.13"
  host_instance_type = var.instance_type
  deployment_mode    = var.environment == "prod" ? "CLUSTER_MULTI_AZ" : "SINGLE_INSTANCE"

  publicly_accessible = false
  subnet_ids          = var.deployment_mode == "SINGLE_INSTANCE" ? [var.subnet_ids[0]] : var.subnet_ids
  security_groups     = [var.mq_sg_id]

  user {
    username = var.mq_username
    password = var.mq_password
  }

  logs {
    general = true
  }

  tags = merge(var.tags, {
    Name = "${var.project}-mq-${var.environment}"
  })
}
```

```hcl
# modules/messaging/variables.tf
variable "project" { type = string }
variable "environment" { type = string }
variable "subnet_ids" { type = list(string) }
variable "mq_sg_id" { type = string }
variable "instance_type" { type = string; default = "mq.t3.micro" }
variable "mq_username" { type = string }
variable "mq_password" { type = string; sensitive = true }
variable "tags" { type = map(string); default = {} }
```

```hcl
# modules/messaging/outputs.tf
output "broker_id" { value = aws_mq_broker.rabbitmq.id }
output "broker_arn" { value = aws_mq_broker.rabbitmq.arn }
output "amqps_endpoint" {
  value = aws_mq_broker.rabbitmq.instances[0].endpoints[0]
}
```

## Notas

- **SINGLE_INSTANCE**: Usa 1 subnet. ~$12/mês com mq.t3.micro.
- **CLUSTER_MULTI_AZ**: Usa 2+ subnets. Mais caro mas com HA.
- **Conexão**: Sempre via AMQPS (porta 5671), nunca AMQP plain.
- **Management Console**: Porta 15672, acessível via SG do app.