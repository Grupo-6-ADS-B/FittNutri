# Networking Module — VPC, Subnets, Route Tables, VPC Endpoints

## Módulo Completo

```hcl
# modules/networking/variables.tf
variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability Zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDRs das subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDRs das subnets privadas de app"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDRs das subnets privadas de DB"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "enable_vpc_endpoints" {
  description = "Criar VPC Endpoints (substitui NAT Gateway)"
  type        = bool
  default     = true
}

variable "vpc_endpoint_security_group_id" {
  description = "SG para VPC Endpoints (HTTPS 443 do CIDR da VPC)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
```

```hcl
# modules/networking/main.tf

# ─── VPC ───
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(var.tags, {
    Name = "${var.project}-vpc-${var.environment}"
  })
}

# ─── INTERNET GATEWAY ───
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.project}-igw-${var.environment}"
  })
}

# ─── SUBNETS PÚBLICAS ───
resource "aws_subnet" "public" {
  count                   = length(var.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.project}-public-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "public"
  })
}

# ─── SUBNETS PRIVADAS APP ───
resource "aws_subnet" "private_app" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.project}-private-app-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "private-app"
  })
}

# ─── SUBNETS PRIVADAS DB ───
resource "aws_subnet" "private_db" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.project}-private-db-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "private-db"
  })
}

# ─── ROUTE TABLE PÚBLICA ───
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.project}-public-rt-${var.environment}"
  })
}

resource "aws_route_table_association" "public" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ─── ROUTE TABLES PRIVADAS (uma por AZ) ───
resource "aws_route_table" "private" {
  count  = length(var.azs)
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.project}-private-rt-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
  })
}

resource "aws_route_table_association" "private_app" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table_association" "private_db" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ─── VPC ENDPOINTS (substituem NAT Gateway, custo zero) ───

# S3 Gateway Endpoint (grátis)
resource "aws_vpc_endpoint" "s3" {
  count             = var.enable_vpc_endpoints ? 1 : 0
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = aws_route_table.private[*].id

  tags = merge(var.tags, {
    Name = "${var.project}-s3-endpoint-${var.environment}"
  })
}

# Interface Endpoints (cobram por hora + dados)
locals {
  interface_endpoints = var.enable_vpc_endpoints ? toset([
    "ecr.api",
    "ecr.dkr",
    "secretsmanager",
    "sts",
    "ssm",
    "ssmmessages",
    "ec2messages",
    "logs",
  ]) : toset([])
}

resource "aws_vpc_endpoint" "interface" {
  for_each = local.interface_endpoints

  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.${each.value}"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private_app[*].id
  security_group_ids  = [var.vpc_endpoint_security_group_id]
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.project}-${replace(each.value, ".", "-")}-endpoint-${var.environment}"
  })
}

data "aws_region" "current" {}
```

```hcl
# modules/networking/outputs.tf
output "vpc_id" {
  value = aws_vpc.main.id
}

output "vpc_cidr" {
  value = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_app_subnet_ids" {
  value = aws_subnet.private_app[*].id
}

output "private_db_subnet_ids" {
  value = aws_subnet.private_db[*].id
}

output "internet_gateway_id" {
  value = aws_internet_gateway.main.id
}
```

## Notas Importantes

### VPC Endpoints vs NAT Gateway
- NAT Gateway: ~$32/mês + $0.045/GB. Simples mas caro.
- VPC Endpoints Interface: ~$7/mês por endpoint. Mais endpoints = mais custo, mas sem custo de dados.
- Para projeto com poucos serviços AWS (ECR, Secrets, SSM), endpoints são mais baratos.
- S3 Gateway Endpoint é GRÁTIS — sempre criar.

### Erros Comuns
- **S3 Gateway não associado a todas as route tables**: Verificar que TODAS as route tables privadas estão listadas.
- **Interface Endpoint com SG errado**: O SG do endpoint precisa permitir ingress TCP 443 do CIDR da VPC. Usar SG DEDICADO, não o mesmo SG das instâncias.
- **Private DNS não habilitado**: Sem `private_dns_enabled = true`, as instâncias não resolvem os endpoints automaticamente.

### SG para VPC Endpoints (CRÍTICO)
```hcl
resource "aws_security_group" "vpce" {
  name_prefix = "${var.project}-vpce-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "HTTPS from VPC"
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