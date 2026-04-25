# Migração FittNutri → ALB + VPC Segmentada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar o código Terraform do FittNutri para migrar do proxy reverso manual (Nginx + Certbot em EC2 pública única) para uma topologia com VPC segmentada, ALB público, ACM para SSL e EC2s privadas, mantendo o MySQL em Docker (sem RDS).

**Architecture:**
- VPC `10.0.0.0/16` com 4 camadas de subnets (pública, privada-app, privada-db, privada-monitoring) em 2 AZs (`us-east-1a` / `us-east-1b`).
- ALB público nas subnets públicas + ACM para terminar SSL — substitui totalmente o papel de Nginx+Certbot como gateway externo.
- NAT Gateway em subnet pública para que as EC2s privadas consigam puxar imagens do ECR/S3/apt.
- EC2 App sem IP público, registrada em Target Group do ALB (porta 8080 interna, onde Nginx local continua roteando frontend/backend no host — mas sem SSL).
- EC2 Database dedicada na subnet privada-db com volume EBS persistente rodando MySQL 8.0 em Docker.
- Packer produz AMI enxuta (Docker + awscli + jq), sem Nginx/Certbot embutidos.

**Tech Stack:**
- Terraform `>= 1.5.0`, provider `hashicorp/aws ~> 5.0`
- Packer `>= 1.2.0` (plugin amazon-ebs)
- AWS: VPC, NAT Gateway, ALB, Target Groups, ACM, EC2, EBS, Security Groups
- Ubuntu 22.04 (AMI base Canonical), Docker, Docker Compose, MySQL 8.0

**Restrições deste laboratório:**
- **NÃO** usar RDS — MySQL permanece em EC2 + Docker.
- **NÃO** criar novos recursos IAM — o módulo `iam/` existente permanece opcional (flag `enable_iam`).
- Ignorar qualquer menção a VPN / Site-to-Site.

**Fontes de verdade consultadas:**
- `fittnutri-arquitetura_1.html` (estado atual)
- `fittnutri-arquitetura-final.html` (estado desejado)
- `fittnutri-nginx-provisioning.html` (configuração Nginx que será substituída)
- `terraform/modules/` + `terraform/packer/` (código V1)

---

## Estrutura de Arquivos Alvo

```
terraform/
├── main.tf                              # MODIFY: passa subnets privadas ao compute, integra alb + acm + database
├── variables.tf                         # MODIFY: adiciona CIDRs privados, domínio ACM, flags
├── outputs.tf                           # MODIFY: remove ssh_command via EIP, expõe ALB DNS e Target Group ARN
├── data.tf                              # MODIFY: adiciona data "aws_route53_zone" (opcional, só se existir)
├── versions.tf                          # unchanged
├── contas/
│   └── exemplo.tfvars.example           # MODIFY: novos CIDRs + domínio ACM + flag enable_alb
├── modules/
│   ├── networking/
│   │   ├── main.tf                      # MODIFY: +subnets privadas +NAT +route tables privadas
│   │   ├── variables.tf                 # MODIFY: +private_app_cidrs, +private_db_cidrs, +private_monitoring_cidrs
│   │   └── outputs.tf                   # MODIFY: +private_app_subnet_ids, +private_db_subnet_ids, ...
│   ├── security/
│   │   ├── main.tf                      # REWRITE: 4 SGs segmentados (alb, app, db, monitoring)
│   │   ├── variables.tf                 # MODIFY: remove ssh_allowed_cidrs público global; aceita cidr via bastion futuro
│   │   └── outputs.tf                   # MODIFY: expõe 4 SG IDs
│   ├── alb/                             # NEW MODULE
│   │   ├── main.tf                      # ALB + listener HTTP redirect + listener HTTPS + target groups
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── acm/                             # NEW MODULE
│   │   ├── main.tf                      # Certificado ACM com validação DNS
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf                      # MODIFY: subnet privada, sem EIP, TG attachment
│   │   ├── user-data.sh.tpl             # REWRITE: remove certbot, remove SSL, Nginx só HTTP :8080
│   │   ├── variables.tf                 # MODIFY: +target_group_arn
│   │   └── outputs.tf                   # MODIFY: remove public_ip, adiciona private_ip
│   ├── database/                        # NEW MODULE
│   │   ├── main.tf                      # EC2 MySQL + EBS volume persistente
│   │   ├── user-data.sh.tpl             # Docker Compose com MySQL 8.0 + bind mount no volume
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/                         # unchanged (já tem S3)
│   └── iam/                             # unchanged (continua opt-in)
├── packer/
│   ├── fittnutri-ami.pkr.hcl            # MODIFY: renomear para fittnutri-docker-base
│   └── scripts/
│       └── setup.sh                     # MODIFY: remove mkdir FittNutri, foca só em runtime Docker
└── scripts/                             # unchanged (apply/destroy/plan)
```

---

## Convenções do Plano

- Todos os commits seguem Conventional Commits (`feat:`, `refactor:`, `chore:`, `docs:`).
- Validação após cada módulo: `terraform -chdir=terraform validate` + `terraform -chdir=terraform fmt -recursive -check`.
- **Não rodar `terraform apply`** em nenhum passo — o objetivo é entregar o código refatorado; o deploy é responsabilidade do CI/CD.
- **Plano (dry-run)** pode ser rodado para validar ao final: `terraform -chdir=terraform plan -var-file=contas/exemplo.tfvars`.
- Nenhum passo cria IAM adicional. O módulo `iam/` existente permanece `count = var.enable_iam ? 1 : 0`.

---

## Fase A — Expansão do Módulo `networking` (subnets privadas + NAT Gateway)

### Task A1: Adicionar variáveis de CIDR privadas ao módulo networking

**Files:**
- Modify: `terraform/modules/networking/variables.tf`

- [x] **Step 1: Adicionar variáveis novas ao fim do arquivo**

```hcl
variable "private_app_subnet_cidrs" {
  description = "CIDRs das subnets privadas de aplicacao (camada EC2 backend/frontend)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDRs das subnets privadas de banco de dados (MySQL em EC2)"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "private_monitoring_subnet_cidrs" {
  description = "CIDRs das subnets privadas de monitoramento (Prometheus + Grafana)"
  type        = list(string)
  default     = ["10.0.30.0/24"]
}

variable "enable_nat_gateway" {
  description = "Habilita NAT Gateway para que subnets privadas tenham saida a internet"
  type        = bool
  default     = true
}
```

- [x] **Step 2: Validar sintaxe**

Run: `terraform -chdir=terraform fmt modules/networking/variables.tf`
Expected: nenhum erro, arquivo formatado.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/networking/variables.tf
git commit -m "feat(networking): adicionar variaveis de CIDR para subnets privadas"
```

---

### Task A2: Criar subnets privadas (app, db, monitoring)

**Files:**
- Modify: `terraform/modules/networking/main.tf`

- [x] **Step 1: Adicionar subnets privadas após o bloco `aws_subnet.public`**

```hcl
# ─── SUBNETS PRIVADAS — APP ───
resource "aws_subnet" "private_app" {
  count             = length(var.private_app_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.project}-private-app-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "private-app"
  })
}

# ─── SUBNETS PRIVADAS — DB ───
resource "aws_subnet" "private_db" {
  count             = length(var.private_db_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.project}-private-db-${substr(var.azs[count.index], -2, 2)}-${var.environment}"
    Tier = "private-db"
  })
}

# ─── SUBNET PRIVADA — MONITORING ───
resource "aws_subnet" "private_monitoring" {
  count             = length(var.private_monitoring_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_monitoring_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index % length(var.azs)]

  tags = merge(var.tags, {
    Name = "${var.project}-private-monitoring-${count.index + 1}-${var.environment}"
    Tier = "private-monitoring"
  })
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [x] **Step 3: Commit**

```bash
git add terraform/modules/networking/main.tf
git commit -m "feat(networking): criar subnets privadas app/db/monitoring em 2 AZs"
```

---

### Task A3: Adicionar NAT Gateway + Elastic IP

**Files:**
- Modify: `terraform/modules/networking/main.tf`

- [x] **Step 1: Adicionar blocos NAT logo após a route table pública**

```hcl
# ─── ELASTIC IP PARA NAT GATEWAY ───
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"

  tags = merge(var.tags, {
    Name = "${var.project}-nat-eip-${var.environment}"
  })

  depends_on = [aws_internet_gateway.main]
}

# ─── NAT GATEWAY (subnet publica 1a) ───
resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = merge(var.tags, {
    Name = "${var.project}-nat-${var.environment}"
  })

  depends_on = [aws_internet_gateway.main]
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [x] **Step 3: Commit**

```bash
git add terraform/modules/networking/main.tf
git commit -m "feat(networking): adicionar NAT Gateway para saida de internet das subnets privadas"
```

---

### Task A4: Criar route tables privadas (uma compartilhada com rota para NAT)

**Files:**
- Modify: `terraform/modules/networking/main.tf`

- [x] **Step 1: Adicionar route table privada + associações**

```hcl
# ─── ROUTE TABLE PRIVADA (compartilhada para app, db, monitoring) ───
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[0].id
    }
  }

  tags = merge(var.tags, {
    Name = "${var.project}-private-rt-${var.environment}"
  })
}

resource "aws_route_table_association" "private_app" {
  count          = length(aws_subnet.private_app)
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_db" {
  count          = length(aws_subnet.private_db)
  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_monitoring" {
  count          = length(aws_subnet.private_monitoring)
  subnet_id      = aws_subnet.private_monitoring[count.index].id
  route_table_id = aws_route_table.private.id
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [x] **Step 3: Commit**

```bash
git add terraform/modules/networking/main.tf
git commit -m "feat(networking): adicionar route table privada com rota default para NAT"
```

---

### Task A5: Expor novos outputs do módulo networking

**Files:**
- Modify: `terraform/modules/networking/outputs.tf`

- [x] **Step 1: Adicionar outputs novos ao final do arquivo**

```hcl
output "private_app_subnet_ids" {
  description = "IDs das subnets privadas de aplicacao"
  value       = aws_subnet.private_app[*].id
}

output "private_db_subnet_ids" {
  description = "IDs das subnets privadas de banco de dados"
  value       = aws_subnet.private_db[*].id
}

output "private_monitoring_subnet_ids" {
  description = "IDs das subnets privadas de monitoramento"
  value       = aws_subnet.private_monitoring[*].id
}

output "nat_gateway_id" {
  description = "ID do NAT Gateway (vazio se desabilitado)"
  value       = var.enable_nat_gateway ? aws_nat_gateway.main[0].id : ""
}
```

- [x] **Step 2: Formatar + validar**

Run: `terraform -chdir=terraform fmt -recursive modules/networking && terraform -chdir=terraform validate`
Expected: formatado, validação OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/networking/outputs.tf
git commit -m "feat(networking): expor outputs de subnets privadas e NAT"
```

---

## Fase B — Refatoração do Módulo `security` (SGs Segmentados por Camada)

**Princípio OWASP A05 (Security Misconfiguration):** cada camada recebe um SG próprio, regras de ingress usam `source_security_group_id` (não CIDR), SSH permanece desabilitado por padrão (acesso via Session Manager / bastion futuro — fora do escopo deste laboratório).

### Task B1: Reescrever security/variables.tf com variáveis novas

**Files:**
- Modify: `terraform/modules/security/variables.tf`

- [x] **Step 1: Substituir o conteúdo pelo novo**

```hcl
variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block da VPC (usado para trafego interno da route table NAT)"
  type        = string
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
```

- [x] **Step 2: Commit**

```bash
git add terraform/modules/security/variables.tf
git commit -m "refactor(security): simplificar variaveis removendo ssh_allowed_cidrs publico"
```

---

### Task B2: Reescrever security/main.tf com 4 SGs segmentados

**Files:**
- Modify: `terraform/modules/security/main.tf` (overwrite completo)

- [x] **Step 1: Substituir todo o arquivo**

```hcl
# ============================================================
# Security Groups segmentados por camada — principio do menor privilegio
# ALB  → App  → DB
#               → Monitoring (scrape)
# ============================================================

# ─── SG ALB (publico, recebe HTTP/HTTPS da internet) ───
resource "aws_security_group" "alb" {
  name_prefix = "${var.project}-alb-"
  description = "ALB publico — entrada HTTP/HTTPS da internet"
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
    description = "Egress — ALB encaminha para targets na VPC"
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
  description = "EC2 App — recebe trafego apenas do ALB"
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
    description = "Egress — ECR, S3 (via NAT), DB, MQ externo"
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
  description = "MySQL — recebe trafego apenas do App SG"
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
    description = "Egress — apt/yum updates via NAT"
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
  description = "Prometheus + Grafana — scrape no App, painel via ALB"
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
    description = "Egress — scrape no App :8080/actuator/prometheus"
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
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform fmt -recursive modules/security && terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [x] **Step 3: Commit**

```bash
git add terraform/modules/security/main.tf
git commit -m "refactor(security): segmentar em 4 SGs (alb/app/db/monitoring) com source_security_group_id"
```

---

### Task B3: Atualizar security/outputs.tf expondo os 4 SG IDs

**Files:**
- Modify: `terraform/modules/security/outputs.tf` (overwrite completo)

- [x] **Step 1: Substituir o arquivo**

```hcl
output "alb_sg_id" {
  description = "ID do Security Group do ALB"
  value       = aws_security_group.alb.id
}

output "app_sg_id" {
  description = "ID do Security Group da EC2 App"
  value       = aws_security_group.app.id
}

output "db_sg_id" {
  description = "ID do Security Group do MySQL"
  value       = aws_security_group.db.id
}

output "monitoring_sg_id" {
  description = "ID do Security Group de Prometheus/Grafana"
  value       = aws_security_group.monitoring.id
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: output antigo `ec2_sg_id` some (vai gerar erro no `main.tf` raiz — corrigido na Fase H).

- [x] **Step 3: Commit**

```bash
git add terraform/modules/security/outputs.tf
git commit -m "refactor(security): expor alb_sg_id/app_sg_id/db_sg_id/monitoring_sg_id"
```

---

## Fase C — Novo Módulo `acm` (Certificado SSL)

### Task C1: Criar esqueleto do módulo acm/

**Files:**
- Create: `terraform/modules/acm/main.tf`
- Create: `terraform/modules/acm/variables.tf`
- Create: `terraform/modules/acm/outputs.tf`

- [x] **Step 1: Criar `variables.tf`**

```hcl
variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "domain_name" {
  description = "Dominio principal do certificado (ex: fittnutri.com.br)"
  type        = string
}

variable "subject_alternative_names" {
  description = "Dominios alternativos (ex: [\"*.fittnutri.com.br\"])"
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "ID da Hosted Zone para validacao DNS. Se vazio, a validacao e DNS_MANUAL (usuario cria o registro manualmente)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
```

- [x] **Step 2: Criar `main.tf`**

```hcl
# ============================================================
# ACM — Certificado SSL (validacao DNS)
# ============================================================

resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  tags = merge(var.tags, {
    Name = "${var.project}-acm-${var.environment}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ─── Validacao via Route 53 (se zone_id informado) ───
resource "aws_route53_record" "validation" {
  for_each = var.route53_zone_id != "" ? {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

resource "aws_acm_certificate_validation" "main" {
  count                   = var.route53_zone_id != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}
```

- [x] **Step 3: Criar `outputs.tf`**

```hcl
output "certificate_arn" {
  description = "ARN do certificado ACM (pendente se validacao DNS nao concluida)"
  value       = aws_acm_certificate.main.arn
}

output "validation_records" {
  description = "Registros DNS para validar manualmente caso route53_zone_id nao informado"
  value       = aws_acm_certificate.main.domain_validation_options
}
```

- [x] **Step 4: Validar**

Run: `terraform -chdir=terraform fmt -recursive modules/acm && terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [x] **Step 5: Commit**

```bash
git add terraform/modules/acm/
git commit -m "feat(acm): novo modulo para certificado SSL com validacao DNS"
```

---

## Fase D — Novo Módulo `alb` (Application Load Balancer)

### Task D1: Criar variables do módulo alb

**Files:**
- Create: `terraform/modules/alb/variables.tf`

- [x] **Step 1: Escrever arquivo**

```hcl
variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs das subnets publicas onde o ALB sera criado (minimo 2 AZs)"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ID do Security Group do ALB"
  type        = string
}

variable "certificate_arn" {
  description = "ARN do certificado ACM para o listener HTTPS"
  type        = string
}

variable "app_health_check_path" {
  description = "Path de health check no target group do App"
  type        = string
  default     = "/actuator/health"
}

variable "grafana_health_check_path" {
  description = "Path de health check no target group do Grafana"
  type        = string
  default     = "/api/health"
}

variable "tags" {
  description = "Tags comuns"
  type        = map(string)
  default     = {}
}
```

- [x] **Step 2: Commit**

```bash
git add terraform/modules/alb/variables.tf
git commit -m "feat(alb): definir variaveis do modulo"
```

---

### Task D2: Criar o ALB + Target Groups no módulo alb/main.tf

**Files:**
- Create: `terraform/modules/alb/main.tf`

- [x] **Step 1: Escrever arquivo**

```hcl
# ============================================================
# Application Load Balancer — substitui Nginx + Certbot como gateway
# ============================================================

resource "aws_lb" "main" {
  name               = "${var.project}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false
  idle_timeout               = 60

  tags = merge(var.tags, {
    Name = "${var.project}-alb-${var.environment}"
  })
}

# ─── Target Group App (Spring Boot + Nginx interno :8080) ───
resource "aws_lb_target_group" "app" {
  name     = "${var.project}-app-tg-${var.environment}"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    path                = var.app_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.project}-app-tg-${var.environment}"
  })
}

# ─── Target Group Grafana (:3000) ───
resource "aws_lb_target_group" "grafana" {
  name     = "${var.project}-grafana-tg-${var.environment}"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    path                = var.grafana_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = merge(var.tags, {
    Name = "${var.project}-grafana-tg-${var.environment}"
  })
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [x] **Step 3: Commit**

```bash
git add terraform/modules/alb/main.tf
git commit -m "feat(alb): criar ALB publico + target groups para app (8080) e grafana (3000)"
```

---

### Task D3: Adicionar listener HTTP com redirect 301 para HTTPS

**Files:**
- Modify: `terraform/modules/alb/main.tf` (append)

- [x] **Step 1: Adicionar bloco ao final do arquivo**

```hcl
# ─── Listener HTTP :80 → redirect 301 para HTTPS ───
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/alb/main.tf
git commit -m "feat(alb): listener HTTP :80 com redirect 301 para HTTPS"
```

---

### Task D4: Adicionar listener HTTPS :443 com forward para o target group app

**Files:**
- Modify: `terraform/modules/alb/main.tf` (append)

- [x] **Step 1: Adicionar bloco**

```hcl
# ─── Listener HTTPS :443 ───
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/alb/main.tf
git commit -m "feat(alb): listener HTTPS :443 com TLS 1.3 e forward para app target group"
```

---

### Task D5: Adicionar listener rule para /grafana/*

**Files:**
- Modify: `terraform/modules/alb/main.tf` (append)

- [x] **Step 1: Adicionar bloco**

```hcl
# ─── Regra do Listener HTTPS: /grafana/* → target group grafana ───
resource "aws_lb_listener_rule" "grafana" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }

  condition {
    path_pattern {
      values = ["/grafana/*"]
    }
  }
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/alb/main.tf
git commit -m "feat(alb): listener rule /grafana/* -> target group grafana"
```

---

### Task D6: Criar outputs do módulo alb

**Files:**
- Create: `terraform/modules/alb/outputs.tf`

- [x] **Step 1: Escrever arquivo**

```hcl
output "alb_arn" {
  description = "ARN do Application Load Balancer"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "DNS publico do ALB (apontar Route 53 ou CNAME)"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID do ALB para alias records do Route 53"
  value       = aws_lb.main.zone_id
}

output "app_target_group_arn" {
  description = "ARN do target group do App (passar ao modulo compute)"
  value       = aws_lb_target_group.app.arn
}

output "grafana_target_group_arn" {
  description = "ARN do target group do Grafana"
  value       = aws_lb_target_group.grafana.arn
}
```

- [x] **Step 2: Validar + formatar**

Run: `terraform -chdir=terraform fmt -recursive modules/alb && terraform -chdir=terraform validate`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/alb/outputs.tf
git commit -m "feat(alb): expor DNS, zone_id e ARNs dos target groups"
```

---

## Fase E — Refatoração do Módulo `compute` (EC2 Privada + TG Attachment)

### Task E1: Atualizar compute/variables.tf com target_group_arn e variáveis de `.env`

**Files:**
- Modify: `terraform/modules/compute/variables.tf`

- [x] **Step 1: Adicionar ao final do arquivo — target group + variáveis de aplicação**

```hcl
variable "target_group_arn" {
  description = "ARN do target group do ALB onde registrar a EC2 (vazio se ALB desabilitado)"
  type        = string
  default     = ""
}

variable "target_group_port" {
  description = "Porta de registro no TG (deve casar com o health check)"
  type        = number
  default     = 8080
}

# ─── Variaveis de aplicacao injetadas no .env via user_data ───
# OBS: user_data fica no metadata da EC2 (IMDSv2 obrigatorio).
# Valores sensiveis devem vir de tfvars gitignorado ou TF_VAR_* no CI.
variable "app_frontend_url" {
  description = "URL publica da aplicacao (ALB DNS ou https://<acm_domain_name>). Injetada como FRONTEND_URL."
  type        = string
}

variable "app_db_host" {
  description = "IP privado da EC2 MySQL (vem de module.database.db_private_ip)"
  type        = string
}

variable "app_db_port" {
  description = "Porta do MySQL"
  type        = number
  default     = 3306
}

variable "app_db_name" {
  description = "Nome do schema MySQL (casa com MYSQL_DATABASE)"
  type        = string
  default     = "fittnutri"
}

variable "app_db_username" {
  description = "SPRING_DATASOURCE_USERNAME"
  type        = string
  default     = "root"
}

variable "app_db_password" {
  description = "SPRING_DATASOURCE_PASSWORD (tambem usada como MYSQL_ROOT_PASSWORD no modulo database)"
  type        = string
  sensitive   = true
}

variable "app_jwt_secret" {
  description = "JWT_SECRET"
  type        = string
  sensitive   = true
}

variable "app_jwt_validity" {
  description = "JWT_VALIDITY (ms)"
  type        = number
  default     = 3600000
}

variable "app_aes_key" {
  description = "APP_AES_KEY (chave simetrica base64)"
  type        = string
  sensitive   = true
}

variable "app_rabbitmq_url" {
  description = "RABBITMQ_URL (AMQPS endpoint CloudAMQP)"
  type        = string
  sensitive   = true
}

variable "app_s3_bucket" {
  description = "AWS_S3_BUCKET (nome final do bucket de PDFs)"
  type        = string
}

variable "app_spring_profile" {
  description = "SPRING_PROFILES_ACTIVE"
  type        = string
  default     = "prod"
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform fmt modules/compute/variables.tf && terraform -chdir=terraform validate`
Expected: arquivo formatado (validate pode falhar temporariamente até main.tf raiz ser atualizado na Fase H).

- [x] **Step 3: Commit**

```bash
git add terraform/modules/compute/variables.tf
git commit -m "feat(compute): aceitar target_group_arn e variaveis sensiveis de .env"
```

---

### Task E2: Remover EIP + adicionar Target Group Attachment em compute/main.tf

**Files:**
- Modify: `terraform/modules/compute/main.tf` (rewrite completo)

- [x] **Step 1: Substituir o arquivo**

```hcl
# ─── EC2 INSTANCE (subnet privada, sem IP publico) ───
resource "aws_instance" "app" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  iam_instance_profile        = var.iam_instance_profile != "" ? var.iam_instance_profile : null
  associate_public_ip_address = false

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = var.ebs_encrypted
    delete_on_termination = true
  }

  # IMDSv2 obrigatorio — previne SSRF (OWASP A10)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data = var.user_data

  tags = merge(var.tags, {
    Name = "${var.project}-app-ec2-${var.environment}"
  })

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# ─── Registrar EC2 no Target Group do ALB ───
resource "aws_lb_target_group_attachment" "app" {
  count            = var.target_group_arn != "" ? 1 : 0
  target_group_arn = var.target_group_arn
  target_id        = aws_instance.app.id
  port             = var.target_group_port
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/compute/main.tf
git commit -m "refactor(compute): remover EIP e registrar EC2 no target group do ALB"
```

---

### Task E3: Atualizar compute/outputs.tf removendo public_ip

**Files:**
- Modify: `terraform/modules/compute/outputs.tf` (rewrite)

- [x] **Step 1: Substituir o arquivo**

```hcl
output "instance_id" {
  description = "ID da instancia EC2"
  value       = aws_instance.app.id
}

output "private_ip" {
  description = "IP privado da EC2"
  value       = aws_instance.app.private_ip
}
```

- [x] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: erros no `outputs.tf` raiz (esperado — corrigido na Fase H).

- [x] **Step 3: Commit**

```bash
git add terraform/modules/compute/outputs.tf
git commit -m "refactor(compute): remover public_ip e eip_allocation_id dos outputs"
```

---

### Task E4: Reescrever user-data.sh.tpl com injeção do `.env` via Terraform (sem IAM/Secrets Manager)

**Estratégia de segredos (sem criar IAM):**
- Variáveis sensíveis vivem em `terraform/contas/<conta>.tfvars` (gitignorado) ou em `TF_VAR_*` no pipeline de CI.
- `templatefile()` interpola os valores no `user-data.sh`. O script **grava o `.env` com `umask 077`** (owner-only) e **chmod 600** após escrita.
- O user-data é acessível apenas via **IMDSv2** (já obrigatório no módulo compute → `http_tokens = "required"`). Nenhum processo externo à EC2 consegue ler.
- **Trade-off conhecido:** user-data aparece em `describe-instance-attribute` para quem tiver EC2 read na conta. Em lab aceitável; em produção real, migrar para Secrets Manager + IAM Role.
- `FRONTEND_URL` passa a ser **derivado dinamicamente** de `acm_domain_name` (ou do ALB DNS como fallback) no `main.tf` raiz — nunca hardcoded.
- `SPRING_DATASOURCE_URL` é **montado** a partir de `db_private_ip:3306` + `app_db_name`.

**Files:**
- Modify: `terraform/modules/compute/user-data.sh.tpl` (rewrite completo)

- [x] **Step 1: Substituir o arquivo**

```bash
#!/bin/bash
set -euo pipefail

# ============================================================
# FittNutri — User Data EC2 App (pos-migracao ALB)
# .env gerado via templatefile() com placeholders do Terraform.
# SSL e terminado no ALB via ACM; Nginx local so HTTP :8080.
# ============================================================

exec > /var/log/user-data.log 2>&1
umask 077

echo "=============================="
echo " FittNutri — App user-data $(date)"
echo "=============================="

APP_DIR="/home/ubuntu/FittNutri"

# --- 1. Sistema ---
apt-get update -y && apt-get upgrade -y

# --- 2. Docker/Compose (AMI ja deve trazer — guard defensivo) ---
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker ubuntu
fi
if ! command -v docker-compose >/dev/null 2>&1; then
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

apt-get install -y git jq

# --- 3. Clone/pull do repo ---
if [ ! -d "$APP_DIR" ]; then
  git clone -b ${git_branch} ${git_repo} "$APP_DIR"
  chown -R ubuntu:ubuntu "$APP_DIR"
else
  cd "$APP_DIR" && git fetch origin && git checkout ${git_branch} && git pull origin ${git_branch}
fi

# --- 4. Gerar .env a partir dos parametros Terraform ---
# Heredoc com delimitador SEM expansao ('EOF' entre aspas) para que $ nao seja interpretado no shell do host.
# As substituicoes $${...} sao do templatefile() do Terraform (duplo $ vira literal $ quando expande).
cat > "$APP_DIR/.env" <<EOF
# Gerado por user-data.sh.tpl em $(date -Iseconds)
# NAO commitar este arquivo.

# --- Banco de dados ---
MYSQL_ROOT_PASSWORD=${app_db_password}
MYSQL_DATABASE=${app_db_name}
SPRING_DATASOURCE_URL=jdbc:mysql://${app_db_host}:${app_db_port}/${app_db_name}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${app_db_username}
SPRING_DATASOURCE_PASSWORD=${app_db_password}

# --- Seguranca ---
JWT_SECRET=${app_jwt_secret}
JWT_VALIDITY=${app_jwt_validity}
APP_AES_KEY=${app_aes_key}

# --- Front/Back ---
FRONTEND_URL=${app_frontend_url}

# --- Infra externa ---
RABBITMQ_URL=${app_rabbitmq_url}
AWS_REGION=${aws_region}
AWS_S3_BUCKET=${app_s3_bucket}

# --- Perfil ---
SPRING_PROFILES_ACTIVE=${app_spring_profile}
EOF

chown ubuntu:ubuntu "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

# --- 5. Start (Nginx local :8080 em HTTP, ALB faz SSL) ---
cd "$APP_DIR"
sg docker -c "bash manage.sh start" 2>/dev/null || bash manage.sh start

echo "=============================="
echo " Deploy concluido $(date)"
echo " SSL: terminado no ALB (ACM)"
echo " DB: ${app_db_host}:${app_db_port}/${app_db_name}"
echo " FRONTEND_URL: ${app_frontend_url}"
echo "=============================="

docker ps
```

**Notas sobre o template:**
- `${app_db_password}`, `${app_jwt_secret}`, etc. são **placeholders do Terraform**, não do shell. A `templatefile()` substitui antes do user-data ser enviado à AWS.
- O `$` literal de `$(date -Iseconds)` está dentro do heredoc com `'EOF'` — não será tocado pelo shell do host nem pelo Terraform.
- Não há dependência de `aws secretsmanager` nem de IAM role — a EC2 pode rodar sem `iam_instance_profile`.

- [x] **Step 2: Validar sintaxe shell (placeholders são esperados)**

Run: `bash -n terraform/modules/compute/user-data.sh.tpl 2>&1 | grep -v '${' || echo "OK — placeholders Terraform causam falsos positivos"`
Expected: nenhum erro real de sintaxe.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/compute/user-data.sh.tpl
git commit -m "refactor(compute): gerar .env via templatefile com DB/ALB/secrets injetados"
```

---

### Task E5: Atualizar nginx/conf.d/fittnutri.conf para escutar só em :8080 HTTP

**Files:**
- Modify: `nginx/conf.d/fittnutri.conf`

> Nota: este arquivo vive **no repositório da aplicação**, não sob `terraform/`. A config precisa ser compatível com o ALB encaminhando já como HTTPS.

- [x] **Step 1: Reescrever o arquivo (simplificado)**

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

server {
    listen 8080;
    server_name _;

    # FRONTEND
    location / {
        proxy_pass         http://frontend:5173;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_cache_bypass $http_upgrade;
    }

    # BACKEND API
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass         http://backend:8080/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
    }

    # Health check para o ALB
    location = /actuator/health {
        proxy_pass http://backend:8080/actuator/health;
    }
}
```

- [x] **Step 2: Validar config Nginx localmente (se docker disponível)**

Run: `docker run --rm -v "$(pwd)/nginx/conf.d:/etc/nginx/conf.d:ro" nginx:alpine nginx -t || echo "opcional — docker local pode nao estar disponivel"`
Expected: `configuration file test is successful` (ou skip se Docker indisponível).

- [x] **Step 3: Commit**

```bash
git add nginx/conf.d/fittnutri.conf
git commit -m "refactor(nginx): simplificar para HTTP :8080 (SSL agora no ALB)"
```

---

### Task E6: Remover serviço certbot do docker-compose.yml

**Files:**
- Modify: `docker-compose.yml` (e qualquer override de produção)

- [x] **Step 1: Remover o serviço `certbot` inteiro do arquivo**

Abrir `docker-compose.yml`, localizar o bloco `certbot:` e apagar. Remover também os volumes `./nginx/certbot/*` do serviço `nginx` e ajustar portas do serviço `nginx` para expor somente `"8080:8080"` (sem `80:80` nem `443:443`).

- [x] **Step 2: Validar**

Run: `docker compose config >/dev/null && echo OK`
Expected: `OK`.

- [x] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "refactor(compose): remover servico certbot e expor nginx apenas em :8080"
```

---

## Fase F — Refatoração do Packer (AMI Limpa)

### Task F1: Renomear e simplificar `fittnutri-ami.pkr.hcl`

**Files:**
- Modify: `terraform/packer/fittnutri-ami.pkr.hcl`

- [x] **Step 1: Substituir o bloco `source` com nome novo**

```hcl
source "amazon-ebs" "fittnutri" {
  ami_name        = "fittnutri-docker-base-{{timestamp}}"
  ami_description = "FittNutri AMI base — Ubuntu 22.04 + Docker + docker-compose + awscli (sem Nginx/Certbot)"
  instance_type   = var.instance_type
  region          = var.aws_region
  ssh_username    = "ubuntu"

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"]
    most_recent = true
  }

  tags = {
    Name      = "fittnutri-docker-base"
    Project   = "fittnutri"
    ManagedBy = "packer"
    Layer     = "base"
    BuildDate = "{{timestamp}}"
  }
}
```

- [x] **Step 2: Validar sintaxe Packer (se CLI disponível)**

Run: `packer validate terraform/packer/fittnutri-ami.pkr.hcl || echo "packer CLI nao disponivel localmente — validar no CI"`
Expected: `The configuration is valid.` (ou skip).

- [x] **Step 3: Commit**

```bash
git add terraform/packer/fittnutri-ami.pkr.hcl
git commit -m "refactor(packer): renomear AMI para fittnutri-docker-base (sem Nginx/Certbot)"
```

---

### Task F2: Enxugar `packer/scripts/setup.sh`

**Files:**
- Modify: `terraform/packer/scripts/setup.sh`

- [x] **Step 1: Substituir o arquivo**

```bash
#!/bin/bash
# ============================================================
# FittNutri — Packer provisioner
# AMI enxuta: Docker + docker-compose + awscli + jq.
# Sem Nginx/Certbot — SSL e terminado no ALB.
# ============================================================

set -e

echo "=============================="
echo " Packer — Instalando runtime Docker"
echo "=============================="

while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
  echo "Aguardando apt..."
  sleep 5
done

sudo apt-get update -y
sudo apt-get upgrade -y

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

sudo apt-get install -y git awscli jq unattended-upgrades

# Limpeza para reduzir tamanho da AMI
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

echo "=============================="
echo " Packer — Setup concluido"
echo " Docker:  $(docker --version)"
echo " Compose: $(docker-compose --version)"
echo "=============================="
```

- [x] **Step 2: Commit**

```bash
git add terraform/packer/scripts/setup.sh
git commit -m "refactor(packer): remover mkdir FittNutri e deixar AMI focada em runtime Docker"
```

---

## Fase G — Novo Módulo `database` (MySQL em EC2 Dedicada)

### Task G1: Criar variáveis do módulo database

**Files:**
- Create: `terraform/modules/database/variables.tf`

- [x] **Step 1: Escrever**

```hcl
variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "ami_id" {
  description = "AMI base (fittnutri-docker-base ou Ubuntu 22.04)"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instancia"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Key Pair SSH"
  type        = string
}

variable "subnet_id" {
  description = "Subnet privada de DB"
  type        = string
}

variable "security_group_ids" {
  description = "SG do DB"
  type        = list(string)
}

variable "data_volume_size" {
  description = "Tamanho do volume EBS de dados (GB)"
  type        = number
  default     = 30
}

variable "data_volume_device" {
  description = "Device path do volume de dados"
  type        = string
  default     = "/dev/sdf"
}

variable "mysql_root_password" {
  description = "MYSQL_ROOT_PASSWORD (tambem exposto como senha do user root para o App). Passar via tfvars gitignorado ou TF_VAR_mysql_root_password."
  type        = string
  sensitive   = true
}

variable "mysql_database" {
  description = "Nome do schema inicial (MYSQL_DATABASE)"
  type        = string
  default     = "fittnutri"
}

variable "ebs_encrypted" {
  description = "Encriptar EBS"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags"
  type        = map(string)
  default     = {}
}
```

- [x] **Step 2: Commit**

```bash
git add terraform/modules/database/variables.tf
git commit -m "feat(database): definir variaveis do modulo MySQL em EC2"
```

---

### Task G2: Criar EC2 + volume EBS persistente em database/main.tf

**Files:**
- Create: `terraform/modules/database/main.tf`

- [x] **Step 1: Escrever**

```hcl
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
```

- [x] **Step 2: Commit**

```bash
git add terraform/modules/database/main.tf
git commit -m "feat(database): provisionar EC2 MySQL com volume EBS persistente"
```

---

### Task G3: Criar user-data do DB com MySQL em Docker (root_password injetado)

**Files:**
- Create: `terraform/modules/database/user-data.sh.tpl`

- [x] **Step 1: Escrever**

```bash
#!/bin/bash
set -euo pipefail
exec > /var/log/user-data-db.log 2>&1
umask 077

echo "=== FittNutri DB boot $(date) ==="

# 1. Formatar volume EBS se ainda nao tiver FS
DATA_DEV="${data_device}"
# espera ate o device aparecer (attachment assincrono)
for i in $(seq 1 30); do
  [ -b "$DATA_DEV" ] && break
  echo "aguardando $DATA_DEV... ($i/30)"
  sleep 2
done

if ! blkid "$DATA_DEV" >/dev/null 2>&1; then
  mkfs.ext4 -F "$DATA_DEV"
fi

# 2. Montar volume em /var/lib/mysql-data (persiste pos-reboot)
mkdir -p /var/lib/mysql-data
grep -q "$DATA_DEV" /etc/fstab || \
  echo "$DATA_DEV /var/lib/mysql-data ext4 defaults,nofail 0 2" >> /etc/fstab
mount -a

# 3. Docker guard
command -v docker >/dev/null 2>&1 || (curl -fsSL https://get.docker.com | sh)

# 4. Gravar secret em arquivo owner-only (nao expoe na ps/linha de comando)
SECRET_DIR=/etc/fittnutri
mkdir -p "$SECRET_DIR"
umask 077
cat > "$SECRET_DIR/mysql.env" <<EOF
MYSQL_ROOT_PASSWORD=${mysql_root_password}
MYSQL_DATABASE=${mysql_database}
EOF
chmod 600 "$SECRET_DIR/mysql.env"

# 5. Subir MySQL 8.0 usando --env-file (credenciais nunca aparecem em 'docker inspect')
docker rm -f fittnutri-mysql 2>/dev/null || true
docker run -d \
  --name fittnutri-mysql \
  --restart unless-stopped \
  -p 3306:3306 \
  -v /var/lib/mysql-data:/var/lib/mysql \
  --env-file "$SECRET_DIR/mysql.env" \
  mysql:8.0 \
  --default-authentication-plugin=caching_sha2_password

echo "=== MySQL up $(date) ==="
docker ps --filter name=fittnutri-mysql
```

**Por que `--env-file` e não `-e`:**
- `-e MYSQL_ROOT_PASSWORD=xxx` aparece em `docker inspect` e em listagens de processos do daemon.
- `--env-file` lê o arquivo no momento do exec e não persiste os valores nas variáveis do container visíveis no `inspect`.

- [x] **Step 2: Validar**

Run: `bash -n terraform/modules/database/user-data.sh.tpl 2>&1 | grep -v '${' || echo "OK — placeholders"`
Expected: sem erros reais.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/database/user-data.sh.tpl
git commit -m "feat(database): user-data monta EBS e sobe MySQL 8.0 com senha via --env-file"
```

---

### Task G4: Criar outputs do módulo database

**Files:**
- Create: `terraform/modules/database/outputs.tf`

- [x] **Step 1: Escrever**

```hcl
output "db_instance_id" {
  description = "ID da EC2 MySQL"
  value       = aws_instance.db.id
}

output "db_private_ip" {
  description = "IP privado do MySQL (usar no .env da App)"
  value       = aws_instance.db.private_ip
}

output "db_volume_id" {
  description = "ID do volume EBS de dados (persistente)"
  value       = aws_ebs_volume.mysql_data.id
}
```

- [x] **Step 2: Formatar + validar**

Run: `terraform -chdir=terraform fmt -recursive modules/database && terraform -chdir=terraform validate`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/database/outputs.tf
git commit -m "feat(database): expor instance_id, private_ip e volume_id"
```

---

## Fase J — Novo Módulo `monitoring` (Prometheus + Grafana em EC2 Privada)

Justificativa: o diagrama final (`fittnutri-arquitetura-final.html`) define uma subnet privada dedicada para monitoring. O Grafana recebe tráfego do ALB via path `/grafana/*` (listener rule já criada na Task D5). O `GRAFANA_ADMIN_PASSWORD` entra via `--env-file` no container, seguindo o mesmo padrão do MySQL.

### Task J1: Criar variables do módulo monitoring

**Files:**
- Create: `terraform/modules/monitoring/variables.tf`

- [x] **Step 1: Escrever**

```hcl
variable "project" {
  type = string
}
variable "environment" {
  type = string
}
variable "ami_id" {
  type = string
}
variable "instance_type" {
  type    = string
  default = "t3.micro"
}
variable "key_name" {
  type = string
}
variable "subnet_id" {
  description = "Subnet privada de monitoring"
  type        = string
}
variable "security_group_ids" {
  type = list(string)
}
variable "ebs_encrypted" {
  type    = bool
  default = true
}
variable "app_private_ip" {
  description = "IP privado da EC2 App (target do scrape Prometheus)"
  type        = string
}
variable "grafana_admin_user" {
  type    = string
  default = "admin"
}
variable "grafana_admin_password" {
  type      = string
  sensitive = true
}
variable "grafana_target_group_arn" {
  description = "ARN do target group /grafana/* no ALB (vazio se ALB desabilitado)"
  type        = string
  default     = ""
}
variable "tags" {
  type    = map(string)
  default = {}
}
```

- [x] **Step 2: Commit**

```bash
git add terraform/modules/monitoring/variables.tf
git commit -m "feat(monitoring): definir variaveis do modulo"
```

---

### Task J2: EC2 + volume + attachment no target group do Grafana

**Files:**
- Create: `terraform/modules/monitoring/main.tf`

- [x] **Step 1: Escrever**

```hcl
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
    app_private_ip         = var.app_private_ip
    grafana_admin_user     = var.grafana_admin_user
    grafana_admin_password = var.grafana_admin_password
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
  count            = var.grafana_target_group_arn != "" ? 1 : 0
  target_group_arn = var.grafana_target_group_arn
  target_id        = aws_instance.monitoring.id
  port             = 3000
}
```

- [x] **Step 2: Commit**

```bash
git add terraform/modules/monitoring/main.tf
git commit -m "feat(monitoring): EC2 privada registrada no target group /grafana/* do ALB"
```

---

### Task J3: User-data do monitoring com Grafana consumindo `--env-file`

**Files:**
- Create: `terraform/modules/monitoring/user-data.sh.tpl`

- [x] **Step 1: Escrever**

```bash
#!/bin/bash
set -euo pipefail
exec > /var/log/user-data-monitoring.log 2>&1
umask 077

echo "=== FittNutri Monitoring boot $(date) ==="

command -v docker >/dev/null 2>&1 || (curl -fsSL https://get.docker.com | sh)

# 1. Prometheus config (scrape no App :8080)
mkdir -p /etc/prometheus
cat > /etc/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: fittnutri-backend
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ['${app_private_ip}:8080']
EOF

# 2. Secrets do Grafana — fora da linha de comando
mkdir -p /etc/fittnutri
cat > /etc/fittnutri/grafana.env <<EOF
GF_SECURITY_ADMIN_USER=${grafana_admin_user}
GF_SECURITY_ADMIN_PASSWORD=${grafana_admin_password}
GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true
EOF
chmod 600 /etc/fittnutri/grafana.env

# 3. Volumes persistentes
docker volume create prom_data >/dev/null
docker volume create graf_data >/dev/null

# 4. Prometheus
docker rm -f fittnutri-prometheus 2>/dev/null || true
docker run -d \
  --name fittnutri-prometheus \
  --restart unless-stopped \
  -p 9090:9090 \
  -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  -v prom_data:/prometheus \
  prom/prometheus:latest

# 5. Grafana com --env-file (senha nao aparece em docker inspect)
docker rm -f fittnutri-grafana 2>/dev/null || true
docker run -d \
  --name fittnutri-grafana \
  --restart unless-stopped \
  -p 3000:3000 \
  -v graf_data:/var/lib/grafana \
  --env-file /etc/fittnutri/grafana.env \
  grafana/grafana:latest

echo "=== Monitoring up $(date) ==="
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

- [x] **Step 2: Commit**

```bash
git add terraform/modules/monitoring/user-data.sh.tpl
git commit -m "feat(monitoring): user-data sobe Prometheus+Grafana com GRAFANA_ADMIN_PASSWORD via --env-file"
```

---

### Task J4: Outputs do módulo monitoring

**Files:**
- Create: `terraform/modules/monitoring/outputs.tf`

- [x] **Step 1: Escrever**

```hcl
output "monitoring_instance_id" {
  value = aws_instance.monitoring.id
}

output "monitoring_private_ip" {
  value = aws_instance.monitoring.private_ip
}
```

- [x] **Step 2: Formatar + validar**

Run: `terraform -chdir=terraform fmt -recursive modules/monitoring && terraform -chdir=terraform validate`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add terraform/modules/monitoring/outputs.tf
git commit -m "feat(monitoring): expor instance_id e private_ip"
```

---

## Fase H — Integração Raiz (main.tf / variables.tf / outputs.tf)

### Task H1: Adicionar variáveis novas na raiz

**Files:**
- Modify: `terraform/variables.tf`

- [ ] **Step 1: Adicionar ao fim do arquivo**

```hcl
# ─── Networking privado ───
variable "private_app_subnet_cidrs" {
  description = "CIDRs das subnets privadas de aplicacao"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDRs das subnets privadas de banco"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "private_monitoring_subnet_cidrs" {
  description = "CIDRs das subnets privadas de monitoramento"
  type        = list(string)
  default     = ["10.0.30.0/24"]
}

variable "enable_nat_gateway" {
  description = "Habilita NAT Gateway (necessario para subnets privadas acessarem ECR/S3/apt)"
  type        = bool
  default     = true
}

# ─── ALB / ACM ───
variable "acm_domain_name" {
  description = "Dominio principal do certificado ACM (ex: fittnutri.com.br)"
  type        = string
  default     = ""
}

variable "acm_subject_alternative_names" {
  description = "SANs adicionais do certificado ACM"
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "Hosted Zone ID para validacao automatica do ACM (vazio = validacao manual)"
  type        = string
  default     = ""
}

variable "enable_alb" {
  description = "Provisiona ALB + ACM. Defina false em laboratorios que nao queiram pagar ALB"
  type        = bool
  default     = true
}

# ─── Database ───
variable "db_instance_type" {
  description = "Tipo da EC2 do MySQL"
  type        = string
  default     = "t3.small"
}

variable "db_data_volume_size" {
  description = "Tamanho do volume EBS dedicado ao MySQL (GB)"
  type        = number
  default     = 30
}

# ─── Aplicacao (.env) — SENSIVEL: preencher via contas/<conta>.tfvars gitignorado ou TF_VAR_* ───
variable "app_db_password" {
  description = "Senha do MySQL (compartilhada entre MYSQL_ROOT_PASSWORD e SPRING_DATASOURCE_PASSWORD)"
  type        = string
  sensitive   = true
}

variable "app_jwt_secret" {
  description = "JWT_SECRET usado pelo backend"
  type        = string
  sensitive   = true
}

variable "app_aes_key" {
  description = "APP_AES_KEY (base64, simetrica)"
  type        = string
  sensitive   = true
}

variable "app_jwt_validity" {
  description = "JWT_VALIDITY (milissegundos)"
  type        = number
  default     = 3600000
}

variable "app_rabbitmq_url" {
  description = "RABBITMQ_URL — AMQPS endpoint (CloudAMQP)"
  type        = string
  sensitive   = true
}

variable "app_s3_bucket" {
  description = "Nome do bucket S3 para PDFs (se enable_s3 for true, pode ser derivado de local.resolved_s3_bucket)"
  type        = string
  default     = ""
}

variable "app_spring_profile" {
  description = "SPRING_PROFILES_ACTIVE"
  type        = string
  default     = "prod"
}

# ─── Monitoring ───
variable "enable_monitoring" {
  description = "Provisiona EC2 de monitoramento (Prometheus + Grafana)"
  type        = bool
  default     = true
}

variable "grafana_admin_user" {
  description = "GRAFANA_ADMIN_USER"
  type        = string
  default     = "admin"
}

variable "grafana_admin_password" {
  description = "GRAFANA_ADMIN_PASSWORD"
  type        = string
  sensitive   = true
}
```

- [ ] **Step 2: Criar `terraform/contas/.gitignore` para proteger tfvars reais**

Criar o arquivo com conteúdo:
```
*.tfvars
!exemplo.tfvars.example
```

- [ ] **Step 3: Commit**

```bash
git add terraform/variables.tf terraform/contas/.gitignore
git commit -m "feat(root): adicionar variaveis sensiveis de .env e proteger tfvars"
```

---

### Task H2: Reescrever `terraform/main.tf` orquestrando todos os módulos novos

**Files:**
- Modify: `terraform/main.tf` (rewrite completo)

- [ ] **Step 1: Substituir o arquivo**

```hcl
# ============================================================
# FittNutri — Orquestrador Terraform (ALB + VPC segmentada)
# ============================================================

# ─── NETWORKING ───
module "networking" {
  source = "./modules/networking"

  project                         = var.project
  environment                     = var.environment
  vpc_cidr                        = var.vpc_cidr
  azs                             = var.azs
  public_subnet_cidrs             = var.public_subnet_cidrs
  private_app_subnet_cidrs        = var.private_app_subnet_cidrs
  private_db_subnet_cidrs         = var.private_db_subnet_cidrs
  private_monitoring_subnet_cidrs = var.private_monitoring_subnet_cidrs
  enable_nat_gateway              = var.enable_nat_gateway
  tags                            = local.common_tags
}

# ─── SECURITY ───
module "security" {
  source = "./modules/security"

  project     = var.project
  environment = var.environment
  vpc_id      = module.networking.vpc_id
  vpc_cidr    = module.networking.vpc_cidr
  tags        = local.common_tags
}

# ─── STORAGE (S3) — Condicional ───
module "storage" {
  source = "./modules/storage"
  count  = var.enable_s3 ? 1 : 0

  project     = var.project
  environment = var.environment
  bucket_name = local.resolved_s3_bucket
  tags        = local.common_tags
}

# ─── IAM — Condicional (NAO CRIAR NOVOS neste laboratorio) ───
module "iam" {
  source = "./modules/iam"
  count  = var.enable_iam ? 1 : 0

  project       = var.project
  environment   = var.environment
  s3_bucket_arn = var.enable_s3 ? module.storage[0].bucket_arn : ""
  tags          = local.common_tags
}

# ─── ACM — Condicional ao ALB ───
module "acm" {
  source = "./modules/acm"
  count  = var.enable_alb ? 1 : 0

  project                   = var.project
  environment               = var.environment
  domain_name               = var.acm_domain_name
  subject_alternative_names = var.acm_subject_alternative_names
  route53_zone_id           = var.route53_zone_id
  tags                      = local.common_tags
}

# ─── ALB — Condicional ───
module "alb" {
  source = "./modules/alb"
  count  = var.enable_alb ? 1 : 0

  project               = var.project
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.security.alb_sg_id
  certificate_arn       = module.acm[0].certificate_arn
  tags                  = local.common_tags
}

# ─── DATABASE (MySQL em EC2 privada dedicada) — criado ANTES do compute para expor db_private_ip ───
module "database" {
  source = "./modules/database"

  project             = var.project
  environment         = var.environment
  ami_id              = local.resolved_ami_id
  instance_type       = var.db_instance_type
  key_name            = var.key_name
  subnet_id           = module.networking.private_db_subnet_ids[0]
  security_group_ids  = [module.security.db_sg_id]
  data_volume_size    = var.db_data_volume_size
  ebs_encrypted       = var.enable_ebs_encryption
  mysql_root_password = var.app_db_password
  mysql_database      = "fittnutri"
  tags                = local.common_tags
}

# ─── FRONTEND_URL dinamico: ACM domain se disponivel, senao ALB DNS, senao private IP ───
locals {
  resolved_frontend_url = (
    var.enable_alb && var.acm_domain_name != "" ? "https://${var.acm_domain_name}" :
    var.enable_alb ? "http://${module.alb[0].alb_dns_name}" :
    "http://${module.compute.private_ip}:8080"
  )

  resolved_app_s3_bucket = (
    var.app_s3_bucket != "" ? var.app_s3_bucket :
    (var.enable_s3 ? module.storage[0].bucket_id : "")
  )
}

# ─── COMPUTE (EC2 App em subnet privada) ───
module "compute" {
  source = "./modules/compute"

  project              = var.project
  environment          = var.environment
  ami_id               = local.resolved_ami_id
  instance_type        = var.instance_type
  key_name             = var.key_name
  subnet_id            = module.networking.private_app_subnet_ids[0]
  security_group_ids   = [module.security.app_sg_id]
  iam_instance_profile = var.enable_iam ? module.iam[0].instance_profile_name : ""
  volume_size          = var.volume_size
  ebs_encrypted        = var.enable_ebs_encryption
  target_group_arn     = var.enable_alb ? module.alb[0].app_target_group_arn : ""
  target_group_port    = 8080

  # --- Parametros de aplicacao (.env) ---
  app_frontend_url   = local.resolved_frontend_url
  app_db_host        = module.database.db_private_ip
  app_db_port        = 3306
  app_db_name        = "fittnutri"
  app_db_username    = "root"
  app_db_password    = var.app_db_password
  app_jwt_secret     = var.app_jwt_secret
  app_jwt_validity   = var.app_jwt_validity
  app_aes_key        = var.app_aes_key
  app_rabbitmq_url   = var.app_rabbitmq_url
  app_s3_bucket      = local.resolved_app_s3_bucket
  app_spring_profile = var.app_spring_profile

  tags = local.common_tags

  user_data = templatefile("${path.module}/modules/compute/user-data.sh.tpl", {
    # infra
    project    = var.project
    aws_region = var.aws_region
    git_repo   = var.git_repo
    git_branch = var.git_branch
    # .env — FRONTEND_URL e db_host dinamicos
    app_frontend_url   = local.resolved_frontend_url
    app_db_host        = module.database.db_private_ip
    app_db_port        = 3306
    app_db_name        = "fittnutri"
    app_db_username    = "root"
    app_db_password    = var.app_db_password
    app_jwt_secret     = var.app_jwt_secret
    app_jwt_validity   = var.app_jwt_validity
    app_aes_key        = var.app_aes_key
    app_rabbitmq_url   = var.app_rabbitmq_url
    app_s3_bucket      = local.resolved_app_s3_bucket
    app_spring_profile = var.app_spring_profile
  })
}

# ─── MONITORING (Prometheus + Grafana em EC2 dedicada) — ver Fase J ───
module "monitoring" {
  source = "./modules/monitoring"
  count  = var.enable_monitoring ? 1 : 0

  project                = var.project
  environment            = var.environment
  ami_id                 = local.resolved_ami_id
  instance_type          = "t3.micro"
  key_name               = var.key_name
  subnet_id              = module.networking.private_monitoring_subnet_ids[0]
  security_group_ids     = [module.security.monitoring_sg_id]
  ebs_encrypted          = var.enable_ebs_encryption
  app_private_ip         = module.compute.private_ip
  grafana_admin_user     = var.grafana_admin_user
  grafana_admin_password = var.grafana_admin_password
  grafana_target_group_arn = var.enable_alb ? module.alb[0].grafana_target_group_arn : ""
  tags                   = local.common_tags
}
```

- [ ] **Step 2: Validar**

Run: `terraform -chdir=terraform fmt -recursive && terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [ ] **Step 3: Commit**

```bash
git add terraform/main.tf
git commit -m "feat(root): orquestrar modulos acm/alb/database e subnets privadas"
```

---

### Task H3: Reescrever `terraform/outputs.tf`

**Files:**
- Modify: `terraform/outputs.tf` (rewrite)

- [ ] **Step 1: Substituir o arquivo**

```hcl
# ─── Aplicacao ───
output "app_url" {
  description = "URL publica da aplicacao (via ALB)"
  value       = var.enable_alb && var.acm_domain_name != "" ? "https://${var.acm_domain_name}" : (var.enable_alb ? "http://${module.alb[0].alb_dns_name}" : "(ALB desabilitado)")
}

output "alb_dns_name" {
  description = "DNS do ALB (apontar Route 53)"
  value       = var.enable_alb ? module.alb[0].alb_dns_name : "(ALB desabilitado)"
}

output "alb_zone_id" {
  description = "Zone ID do ALB para alias records"
  value       = var.enable_alb ? module.alb[0].alb_zone_id : ""
}

output "acm_certificate_arn" {
  description = "ARN do certificado ACM"
  value       = var.enable_alb ? module.acm[0].certificate_arn : ""
}

# ─── Compute ───
output "app_instance_id" {
  description = "ID da EC2 App"
  value       = module.compute.instance_id
}

output "app_private_ip" {
  description = "IP privado da EC2 App"
  value       = module.compute.private_ip
}

# ─── Database ───
output "db_private_ip" {
  description = "IP privado do MySQL (usar em DB_HOST)"
  value       = module.database.db_private_ip
}

output "db_volume_id" {
  description = "ID do volume EBS persistente do MySQL"
  value       = module.database.db_volume_id
}

# ─── Networking ───
output "vpc_id" {
  description = "ID da VPC"
  value       = module.networking.vpc_id
}

output "private_app_subnet_ids" {
  description = "IDs das subnets privadas de App"
  value       = module.networking.private_app_subnet_ids
}

# ─── Storage (condicional) ───
output "s3_bucket_name" {
  description = "Bucket S3 (vazio se desabilitado)"
  value       = var.enable_s3 ? module.storage[0].bucket_id : "(S3 desabilitado)"
}

# ─── Conta AWS ───
output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  value = data.aws_region.current.name
}
```

- [ ] **Step 2: Validar**

Run: `terraform -chdir=terraform validate`
Expected: `Success! The configuration is valid.`

- [ ] **Step 3: Commit**

```bash
git add terraform/outputs.tf
git commit -m "refactor(root): expor ALB DNS, ACM ARN, DB private IP; remover ssh_command via EIP"
```

---

### Task H4: Atualizar `terraform/contas/exemplo.tfvars.example` com variáveis novas

**Files:**
- Modify: `terraform/contas/exemplo.tfvars.example`

- [ ] **Step 1: Acrescentar ao final**

```hcl
# ─── ALB + ACM ───
enable_alb                    = true
acm_domain_name               = "fittnutri.com.br"
acm_subject_alternative_names = ["*.fittnutri.com.br"]
route53_zone_id               = ""  # preencher se a zona existir, senao validacao DNS manual

# ─── Networking privado ───
enable_nat_gateway              = true
private_app_subnet_cidrs        = ["10.0.10.0/24", "10.0.11.0/24"]
private_db_subnet_cidrs         = ["10.0.20.0/24", "10.0.21.0/24"]
private_monitoring_subnet_cidrs = ["10.0.30.0/24"]

# ─── Database ───
db_instance_type    = "t3.small"
db_data_volume_size = 30

# ─── Aplicacao (.env) — NAO COMMITAR VALORES REAIS ───
# Copie para contas/<conta>.tfvars (gitignorado) e preencha.
# Alternativa: export TF_VAR_app_db_password=... no shell/CI.
app_db_password        = "SUBSTITUA_ANTES_DO_APPLY"
app_jwt_secret         = "SUBSTITUA_ANTES_DO_APPLY"
app_aes_key            = "SUBSTITUA_ANTES_DO_APPLY"
app_jwt_validity       = 3600000
app_rabbitmq_url       = "amqps://USUARIO:SENHA@HOST/VHOST"
app_s3_bucket          = ""   # vazio = usa local.resolved_s3_bucket do modulo storage
app_spring_profile     = "prod"

# ─── Monitoring ───
enable_monitoring      = true
grafana_admin_user     = "admin"
grafana_admin_password = "SUBSTITUA_ANTES_DO_APPLY"
```

- [ ] **Step 2: Commit**

```bash
git add terraform/contas/exemplo.tfvars.example
git commit -m "docs(contas): adicionar exemplos para ALB/ACM/DB/networking/app env/monitoring"
```

---

### Task H5: Rodar `terraform plan` final (dry-run completo)

**Files:** nenhum (apenas validação)

- [ ] **Step 1: Criar um tfvars real de teste (NÃO commitar)**

```bash
cp terraform/contas/exemplo.tfvars.example terraform/contas/teste.tfvars
# editar terraform/contas/teste.tfvars preenchendo key_name e acm_domain_name
```

- [ ] **Step 2: Init + validate + plan**

Run:
```bash
terraform -chdir=terraform init -upgrade
terraform -chdir=terraform validate
terraform -chdir=terraform plan -var-file=contas/teste.tfvars -out=/tmp/fittnutri.plan
```
Expected: plan mostra criação de VPC, 2+2+2+1 subnets, NAT GW, 4 SGs, 1 ACM cert, 1 ALB + 2 TGs + 2 listeners + 1 rule, 2 EC2s (app + db), 1 EBS volume, 1 TG attachment. **Zero erros.**

- [ ] **Step 3: Limpar arquivo de teste**

Run: `rm terraform/contas/teste.tfvars /tmp/fittnutri.plan`

- [ ] **Step 4: Nenhum commit (dry-run apenas)**

---

## Fase I — Documentação Final

### Task I1: Adicionar README descritivo em `terraform/modules/alb/README.md`

**Files:**
- Create: `terraform/modules/alb/README.md`

- [ ] **Step 1: Escrever arquivo curto**

```markdown
# Módulo `alb`

ALB público que substitui o Nginx+Certbot como gateway externo.

- Listener :80 → redirect 301 HTTPS
- Listener :443 com ACM (TLS 1.3), default forward → target group `app` (:8080)
- Listener rule `/grafana/*` → target group `grafana` (:3000)
- Health checks: `/actuator/health` (app) e `/api/health` (grafana)

Security Group do ALB aceita 80/443 da internet e faz egress para os SGs internos `app` e `monitoring`.
```

- [ ] **Step 2: Commit**

```bash
git add terraform/modules/alb/README.md
git commit -m "docs(alb): descrever comportamento do modulo e health checks"
```

---

### Task I2: Dispatch do plan-document-reviewer

- [ ] **Step 1: Rodar reviewer** (conforme writing-plans skill):

Usar o subagent `plan-document-reviewer` passando:
- Caminho do plano: `docs/superpowers/plans/2026-04-17-migracao-alb-vpc-segmentada.md`
- Caminho da especificação: diagramas `fittnutri-arquitetura-final.html` + `fittnutri-arquitetura_1.html`

Se houver feedback, iterar. Se aprovado, handoff para execução.

---

## Resumo de Handoff

Após o merge deste plano, o engenheiro terá:

1. **VPC segmentada** em 4 camadas com NAT Gateway.
2. **ALB público** terminando SSL via ACM (TLS 1.3), com rota default → App e `/grafana/*` → Grafana.
3. **EC2 App privada** sem IP público, registrada no Target Group do ALB; Nginx local continua como router interno em HTTP :8080.
4. **EC2 DB privada** com volume EBS dedicado rodando MySQL 8.0 em Docker.
5. **AMI limpa** (`fittnutri-docker-base`) sem Nginx/Certbot embutidos.
6. **4 Security Groups** (alb/app/db/monitoring) com regras de ingress usando `source_security_group_id` — princípio do menor privilégio (OWASP A05).
7. **Zero recursos IAM novos** criados — respeitando a restrição do laboratório.

**Próximos passos (fora do escopo deste plano):**
- Migrar Nginx+Prometheus+Grafana para EC2 de monitoring dedicada na subnet privada-monitoring.
- Migrar acesso SSH para Session Manager (IAM) ou bastion host.
- CI/CD: pipeline GitHub Actions para build da AMI via Packer e rollout via Terraform.
- Futuro: substituir EC2 App por Auto Scaling Group quando o laboratório permitir.
