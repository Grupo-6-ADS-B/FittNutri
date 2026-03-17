---
name: aws-terraform-infra
description: "Skill para provisionar, evoluir e manter infraestrutura AWS usando Terraform e CLI. Use SEMPRE que o usuário mencionar: Terraform, IaC, infraestrutura como código, provisionar AWS, criar recursos AWS, migração de infra, VPC, ALB, ASG, RDS, ECR, Security Groups, Launch Template, VPC Endpoints, ou qualquer tarefa que envolva criar/modificar/destruir recursos AWS de forma automatizada. Também use quando o usuário pedir para transformar infra manual (ClickOps/CLI) em código Terraform, planejar arquitetura AWS, estimar custos, ou debugar problemas de rede/conectividade em AWS. Trigger inclusive para perguntas sobre módulos Terraform, state management, workspaces, e CI/CD com Terraform."
---

# AWS + Terraform Infrastructure Skill

## Objetivo

Ajudar a provisionar, evoluir e manter infraestrutura AWS usando Terraform como IaC principal, com suporte a CLI para diagnóstico e operações pontuais.

## Quando Usar

- Criar infraestrutura AWS do zero via Terraform
- Migrar infra existente (ClickOps/CLI) para Terraform
- Diagnosticar problemas de rede, SG, endpoints, conectividade
- Evoluir arquitetura (ex: EC2 single → ALB + ASG + RDS)
- Planejar e estimar custos
- CI/CD pipeline para infra (GitHub Actions + Terraform)

## Estrutura do Projeto Terraform

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── modules/
│   ├── networking/        # VPC, Subnets, IGW, NAT, Route Tables
│   ├── security/          # Security Groups, NACLs
│   ├── compute/           # ASG, Launch Template, ALB, Target Groups
│   ├── database/          # RDS, Subnet Groups
│   ├── messaging/         # Amazon MQ (RabbitMQ)
│   ├── container/         # ECR repositories
│   ├── dns/               # Route53, ACM certificates
│   ├── storage/           # S3 buckets
│   ├── secrets/           # Secrets Manager
│   ├── monitoring/        # CloudWatch, alarms
│   └── iam/               # Roles, policies, instance profiles
└── scripts/
    ├── deploy.sh          # Wrapper para terraform apply
    ├── destroy.sh         # Wrapper para terraform destroy
    └── import-existing.sh # Importar recursos existentes
```

## Workflow de Desenvolvimento

### 1. Novo Projeto

```bash
# Inicializar
cd terraform/environments/dev
terraform init

# Planejar (SEMPRE antes de apply)
terraform plan -out=tfplan

# Aplicar
terraform apply tfplan

# Verificar
terraform output
```

### 2. Migrar Infra Existente para Terraform

Para importar recursos já criados manualmente:

```bash
# 1. Escrever o código Terraform para o recurso
# 2. Importar o state
terraform import aws_vpc.main vpc-0b561ac9104d6a2c1
terraform import aws_subnet.public_1a subnet-073b3c80123291f2e

# 3. Rodar plan para verificar drift
terraform plan

# 4. Ajustar código até plan mostrar "No changes"
```

### 3. Destruir Recursos

```bash
# SEMPRE com target para evitar destruir tudo
terraform destroy -target=aws_instance.temp

# Ou destruir tudo (cuidado!)
terraform destroy
```

## Princípios de Design

### Naming Convention
- Recursos: `{projeto}-{componente}-{env}` → `fittnutri-alb-prod`
- Tags obrigatórias: `Name`, `Project`, `Environment`, `ManagedBy=terraform`

### Segurança
- Nunca hardcode credentials no código
- Usar `terraform.tfvars` + `.gitignore` para valores sensíveis
- Secrets via AWS Secrets Manager (não em variáveis TF)
- SGs com princípio de menor privilégio
- Backend remoto (S3 + DynamoDB) para state em produção

### State Management
- Dev: local state (OK para começar)
- Prod: S3 backend com locking via DynamoDB
- NUNCA editar state manualmente

### Módulos
- Um módulo por domínio (networking, compute, database, etc.)
- Outputs explícitos entre módulos
- Variáveis com description e type sempre
- Usar `depends_on` explícito quando necessário

## Referências

Para detalhes de implementação de cada módulo, consulte:

- `references/networking.md` — VPC, Subnets, Route Tables, IGW, NAT, VPC Endpoints
- `references/compute.md` — ALB, ASG, Launch Template, Target Groups, AMIs
- `references/database.md` — RDS MySQL, Subnet Groups, Parameter Groups
- `references/security.md` — Security Groups, IAM Roles, NACLs
- `references/messaging.md` — Amazon MQ RabbitMQ
- `references/cicd.md` — GitHub Actions + Terraform + ECR deploy pipeline
- `references/troubleshooting.md` — Diagnóstico AWS CLI, problemas comuns

## Checklist Pré-Apply

Antes de qualquer `terraform apply`, verificar:

1. [ ] `terraform fmt` — código formatado
2. [ ] `terraform validate` — sintaxe válida
3. [ ] `terraform plan` — revisado, sem surpresas
4. [ ] Tags presentes em todos os recursos
5. [ ] Security Groups com regras mínimas
6. [ ] Outputs definidos para recursos que serão referenciados
7. [ ] `.tfvars` no `.gitignore`
8. [ ] Nenhuma credential hardcoded

## Diagnóstico Rápido via CLI

Quando o Terraform não é suficiente e precisa diagnosticar na hora:

```bash
# Sempre setar no início
export AWS_PAGER=""
REGION="us-east-1"

# Verificar conectividade de instâncias privadas
# 1. VPC Endpoints existentes
aws ec2 describe-vpc-endpoints --region $REGION \
  --filters "Name=vpc-id,Values=VPC_ID" \
  --query 'VpcEndpoints[*].{Name:Tags[?Key==`Name`].Value|[0],Service:ServiceName,State:State}' --output table

# 2. Route tables (verificar blackhole)
aws ec2 describe-route-tables --region $REGION \
  --filters "Name=vpc-id,Values=VPC_ID" \
  --query 'RouteTables[*].{Name:Tags[?Key==`Name`].Value|[0],Routes:Routes[?State==`blackhole`]}' --output json

# 3. SG rules
aws ec2 describe-security-groups --region $REGION \
  --group-ids SG_ID --output json

# 4. Target health
aws elbv2 describe-target-health --region $REGION \
  --target-group-arn TG_ARN --output table

# 5. Logs de instância (via SSM)
aws ssm send-command --region $REGION \
  --instance-ids INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cat /var/log/cloud-init-output.log"]' \
  --query 'Command.CommandId' --output text
```

## Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `TargetNotConnected` SSM | Faltam VPC Endpoints (ssm, ssmmessages, ec2messages) | Criar endpoints com SG dedicado permitindo 443 do CIDR da VPC |
| Health check unhealthy | App não responde no path configurado | Verificar SG, porta, path. Usar `/` ou TCP se app depende de DB |
| ECR login timeout | Faltam endpoints ecr.api + ecr.dkr + sts | Criar endpoints. S3 Gateway para layers |
| NAT blackhole | NAT Gateway deletado mas rota ainda existe | Remover rota ou criar novo NAT |
| `InvalidSubnetId.Malformed` | IDs separados por vírgula em vez de espaço | Usar espaço: `--subnet-ids sub1 sub2` |
| cloud-init não executa | AMI sem dependências ou User Data com erro | Bake AMI com tudo instalado, User Data mínimo |
