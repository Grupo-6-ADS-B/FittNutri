# Runbook — Deploy FittNutri na AWS com Terraform

> Contexto: conta AWS Academy (credenciais STS com expiração ~4h).
> Domínio: `fittnutri.site` gerenciado no Namecheap.
> Branch de deploy: `claude-test` (mudar para `main` em produção real).

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Atualizar credenciais AWS Academy](#2-atualizar-credenciais-aws-academy)
3. [Primeira vez: terraform apply](#3-primeira-vez-terraform-apply)
4. [Configurar DNS no Namecheap](#4-configurar-dns-no-namecheap)
5. [Aguardar validação do certificado ACM](#5-aguardar-validação-do-certificado-acm)
6. [Verificar saúde da aplicação](#6-verificar-saúde-da-aplicação)
7. [Carregar dados iniciais (alimentos TACO)](#7-carregar-dados-iniciais-alimentos-taco)
8. [Criar usuário de teste](#8-criar-usuário-de-teste)
9. [Validar endpoint de busca de alimentos](#9-validar-endpoint-de-busca-de-alimentos)
10. [Redeploy após mudança de código](#10-redeploy-após-mudança-de-código)
11. [Recriar infra após destruição](#11-recriar-infra-após-destruição)
12. [Armadilhas conhecidas](#12-armadilhas-conhecidas)

---

## 1. Pré-requisitos

- Terraform >= 1.5 instalado
- AWS CLI configurado
- Repositório clonado, branch `claude-test` (ou sua branch de trabalho)
- Arquivo `terraform/contas/lab.tfvars` criado (está no `.gitignore` — nunca commitar)
- Key Pair `fittnutri` criado na conta AWS

**Estrutura mínima do `lab.tfvars`:**
```hcl
aws_region            = "us-east-1"
environment           = "prod"
project               = "fittnutri"
instance_type         = "t3.medium"   # t3.small estourava RAM no build Maven+Vite
key_name              = "fittnutri"
git_branch            = "claude-test"
enable_iam            = false
existing_instance_profile = "LabInstanceProfile"
enable_alb            = true
alb_allowed_cidrs     = ["0.0.0.0/0"]   # publico; ou seu IP/32 para restringir
enable_https          = true
acm_domain_name       = "fittnutri.site"
acm_subject_alternative_names = ["www.fittnutri.site"]
route53_zone_id       = ""              # sem Route53 — DNS manual no Namecheap
app_db_password       = "SUA_SENHA_AQUI"
app_jwt_secret        = "SEU_JWT_SECRET"
app_aes_key           = "SUA_AES_KEY"
app_rabbitmq_url      = "amqps://..."
app_spring_profile    = "prod"
enable_monitoring     = true
grafana_admin_password = "SUA_SENHA_GRAFANA"
```

---

## 2. Atualizar credenciais AWS Academy

As credenciais do lab expiram a cada ~4h. Sempre que ligar o lab novamente:

1. Abra o **AWS Academy Learner Lab** no navegador
2. Clique em **AWS Details** → **AWS CLI**
3. Copie o bloco com `aws_access_key_id`, `aws_secret_access_key`, `aws_session_token`
4. Cole em `~/.aws/credentials` (substitua a seção `[default]`)

```ini
[default]
aws_access_key_id     = ASIA...
aws_secret_access_key = ...
aws_session_token     = ...
```

5. Se o Claude Code ou outro processo estava aberto, limpe as variáveis de ambiente
   que podem sobrescrever o arquivo (no bash/WSL):
```bash
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
```

6. Confirme que funciona:
```bash
aws sts get-caller-identity
```

> **Armadilha — variáveis de ambiente têm prioridade sobre `~/.aws/credentials`:**
> Se `AWS_ACCESS_KEY_ID` estiver definida no ambiente (herdada do processo que abriu
> o terminal ou setada por outro script), o AWS CLI usa essa variável e **ignora**
> o arquivo de credenciais — mesmo que o arquivo tenha valores novos e válidos.
> Sintoma: `aws sts get-caller-identity` retorna `ExpiredToken` mesmo após atualizar
> o arquivo. Solução: sempre rodar o `unset` acima antes de qualquer comando AWS/Terraform.

> **Por que não colocar as credenciais no `.env` ou no código?**
> As EC2s usam o `LabInstanceProfile` (IAM Instance Profile), então os contêineres
> obtêm credenciais automaticamente via metadata (DefaultCredentialsProvider).
> Credenciais STS hardcoded no .env expiram e quebram o S3.

---

## 3. Primeira vez: terraform apply

```bash
cd terraform/

# Inicializar (apenas na primeira vez ou após mudar providers)
terraform init

# Verificar o plano (~43 recursos)
terraform plan -var-file="contas/lab.tfvars"

# Aplicar (demora ~5 minutos)
terraform apply -var-file="contas/lab.tfvars" -auto-approve
```

**Outputs importantes após o apply:**
```
alb_dns_name = "fittnutri-alb-prod-XXXXXXXXXX.us-east-1.elb.amazonaws.com"
app_instance_id = "i-XXXXXXXXXXXXXXXXX"
db_private_ip   = "10.0.20.XX"
```

Anote o `alb_dns_name` — você precisará dele para configurar o Namecheap.

---

## 4. Configurar DNS no Namecheap

O certificado ACM precisa de validação via CNAME, e o ALB precisa de dois registros CNAME.

### 4.1 Obter os CNAMEs necessários

```bash
# CNAMEs de validação do certificado ACM
aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='fittnutri.site'].CertificateArn" \
  --output text | xargs -I{} aws acm describe-certificate \
  --certificate-arn {} \
  --query "Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Value]" \
  --output table

# DNS do ALB (já está no output do terraform)
terraform output alb_dns_name -var-file="contas/lab.tfvars"
```

### 4.2 Registros a criar no Namecheap

Acesse **Namecheap → Domain List → fittnutri.site → Manage → Advanced DNS**
e crie/atualize os seguintes registros:

| Tipo  | Host                    | Value                                       | TTL  |
|-------|-------------------------|---------------------------------------------|------|
| CNAME | `www`                   | `fittnutri-alb-prod-XXXX.us-east-1.elb.amazonaws.com` | Auto |
| CNAME | `@` (ou subdomínio raiz)| `fittnutri-alb-prod-XXXX.us-east-1.elb.amazonaws.com` | Auto |
| CNAME | `_XXXXX` (ACM root)     | `_YYYY.acm-validations.aws.`                | Auto |
| CNAME | `_XXXXX.www` (ACM www)  | `_ZZZZ.acm-validations.aws.`                | Auto |

> **Atenção — o que muda e o que não muda a cada destroy/apply:**
>
> - **DNS do ALB** (`www` e `@`): **sempre muda** — novo ALB = novo DNS.
>   Atualize com o `alb_dns_name` do output do terraform.
>
> - **CNAMEs de validação do ACM** (`_XXXXX`): **não mudam** — a AWS reutiliza os
>   mesmos valores de validação para o mesmo domínio, mesmo que o certificado seja
>   recriado com um ARN diferente. Não é necessário atualizar esses registros no
>   Namecheap após um destroy/apply.

> **Namecheap e registro raiz `@`:** O Namecheap não permite CNAME no `@` diretamente.
> Use o tipo **ALIAS** ou **URL Redirect** se disponível, ou aponte apenas `www`
> e configure um redirect `fittnutri.site → www.fittnutri.site` no próprio Namecheap.

---

## 5. Aguardar validação do certificado ACM

Após criar os CNAMEs de validação, aguarde até 30 minutos:

```bash
# Verificar status do certificado
aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='fittnutri.site'].[DomainName,Status]" \
  --output table
```

Deve mostrar `ISSUED`. Enquanto estiver `PENDING_VALIDATION`, o HTTPS não funciona.

---

## 6. Verificar saúde da aplicação

Aguarde ~3 minutos após o `terraform apply` para os contêineres subirem.

```bash
# Health check via ALB
curl -s https://www.fittnutri.site/api/actuator/health
# Esperado: {"status":"UP"}

# Verificar logs do backend via SSM
APP_INSTANCE=$(terraform output -raw app_instance_id -var-file="contas/lab.tfvars" 2>/dev/null)
aws ssm send-command \
  --instance-ids "$APP_INSTANCE" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker compose -f /home/ubuntu/FittNutri/docker-compose.prod.yml ps"]' \
  --query "Command.CommandId" --output text
# Aguardar e checar com: aws ssm get-command-invocation --command-id "ID" --instance-id "$APP_INSTANCE" --query "StandardOutputContent" --output text
```

**Contêineres esperados:**
```
backend    Up    8080/tcp
frontend   Up    80/tcp, 5173/tcp
nginx      Up    0.0.0.0:8080->8080/tcp
```

---

## 7. Carregar dados iniciais (alimentos TACO)

> **Por que fazer isso manualmente?**
> `spring.sql.init.mode=never` está configurado no perfil `prod` para evitar que
> o `data.sql` execute a cada restart (o UPDATE que divide valores por 100 seria
> aplicado repetidamente, corrompendo os dados).

Na **primeira vez** (ou após recriar o banco), execute:

```bash
APP_INSTANCE="i-XXXXXXXXXXXXXXXXX"   # output do terraform
DB_INSTANCE="i-XXXXXXXXXXXXXXXXX"    # tag fittnutri-db-ec2-prod

# Instalar mysql-client no servidor de app (se necessário)
aws ssm send-command \
  --instance-ids "$APP_INSTANCE" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["apt-get install -y mysql-client 2>/dev/null | tail -1"]'

# Aguardar e então rodar o script de carga
SCRIPT='
DB_PASS=$(grep "SPRING_DATASOURCE_PASSWORD" /home/ubuntu/FittNutri/.env | cut -d= -f2 | tr -d "\r\n")
DB_IP=$(grep "SPRING_DATASOURCE_URL" /home/ubuntu/FittNutri/.env | grep -oP "(?<=//)[0-9.]+")
mysql -h "$DB_IP" -uroot -p"$DB_PASS" fittnutri -e "
  SET FOREIGN_KEY_CHECKS=0;
  TRUNCATE TABLE alimentos;
  SET FOREIGN_KEY_CHECKS=1;
"
mysql -h "$DB_IP" -uroot -p"$DB_PASS" fittnutri < /home/ubuntu/FittNutri/backend/src/main/resources/data.sql
mysql -h "$DB_IP" -uroot -p"$DB_PASS" fittnutri -e "
  UPDATE alimentos SET fonte = '"'"'TACO'"'"' WHERE fonte IS NULL OR fonte = '"'"''"'"';
  SELECT COUNT(*) as total, fonte FROM alimentos GROUP BY fonte;
"
echo "Carga concluida"
'
ENCODED=$(printf '%s' "$SCRIPT" | base64 -w0)
aws ssm send-command \
  --instance-ids "$APP_INSTANCE" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"echo '${ENCODED}' | base64 -d | bash\"]"
```

**Resultado esperado:** `597 | TACO` (597 alimentos da tabela TACO com `fonte = 'TACO'`).

> **Por que `fonte` fica vazio sem o UPDATE?**
> O `data.sql` não inclui a coluna `fonte` no INSERT. MySQL em modo não-estrito
> insere string vazia `''` em vez de NULL quando a coluna é NOT NULL sem DEFAULT.
> A query `searchByNameForNutricionista` filtra por `fonte = 'TACO'`, então sem
> o UPDATE a busca não retorna nada.

---

## 8. Criar usuário de teste

Para testar o login e endpoints autenticados sem criar usuário pela UI:

```bash
DB_INSTANCE="i-XXXXXXXXXXXXXXXXX"

# Gerar hash bcrypt no próprio servidor (evita corrupção por interpolação de shell)
SCRIPT='
python3 -c "
import bcrypt
h = bcrypt.hashpw(b\"Teste@12345\", bcrypt.gensalt(10)).decode()
print(h)
" > /tmp/newhash.txt
HASH=$(cat /tmp/newhash.txt)
echo "Hash: $HASH"
docker exec fittnutri-mysql mysql -uroot -p'"'"'SENHA_DO_BANCO'"'"' fittnutri -e "
  INSERT IGNORE INTO usuario (nome, email, cpf, crn, senha, role, created_at, updated_at)
  VALUES ('"'"'Teste Claude'"'"', '"'"'teste@fittnutri.site'"'"', '"'"'TEST-CPF-001'"'"',
          '"'"'CRN-TEST-0'"'"', \"$HASH\", '"'"'NUTRI'"'"', NOW(), NOW());
  SELECT id, email, role FROM usuario;
" 2>/dev/null
'
ENCODED=$(printf '%s' "$SCRIPT" | base64 -w0)
aws ssm send-command \
  --instance-ids "$DB_INSTANCE" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"echo '${ENCODED}' | base64 -d | bash\"]"
```

**Credenciais criadas:** `teste@fittnutri.site` / `Teste@12345`

> **Por que gerar o hash no servidor e não localmente?**
> Se você copiar o hash `$2b$10$...` para um script bash com aspas duplas,
> o shell expande `$2` como argumento posicional e o hash é corrompido.
> Gerar no servidor via Python elimina esse problema.

---

## 9. Validar endpoint de busca de alimentos

```bash
# 1. Login
RESPONSE=$(curl -s -X POST "https://www.fittnutri.site/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@fittnutri.site","senha":"Teste@12345"}')
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token obtido: ${TOKEN:0:40}..."

# 2. Busca de alimentos
curl -s "https://www.fittnutri.site/api/food-itens/search-part?nomeParte=arroz" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
```

**Resposta esperada:** lista JSON com alimentos como `"Arroz, integral, cozido"`,
`"energiaKcal": 1.2353` (kcal/g — o sistema armazena por grama, não por 100g).

---

## 10. Redeploy após mudança de código

Após commitar e fazer push para a branch de deploy:

```bash
APP_INSTANCE="i-XXXXXXXXXXXXXXXXX"

# Via SSM — atualiza código e reconstrói apenas o backend
SCRIPT='
cd /home/ubuntu/FittNutri
sudo -u ubuntu git checkout -- .
sudo -u ubuntu git fetch origin
sudo -u ubuntu git reset --hard origin/claude-test
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --force-recreate backend
docker compose -f docker-compose.prod.yml ps
'
ENCODED=$(printf '%s' "$SCRIPT" | base64 -w0)
aws ssm send-command \
  --instance-ids "$APP_INSTANCE" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"echo '${ENCODED}' | base64 -d | bash\"]"
```

Para reconstruir frontend também, troque `backend` por `frontend nginx backend`.

---

## 11. Recriar infra após destruição

Se fizer `terraform destroy` (ou a infra foi destruída automaticamente pelo lab):

1. Atualize as credenciais AWS (passo 2)
2. `terraform apply -var-file="contas/lab.tfvars" -auto-approve`
3. Atualize os CNAMEs do ALB no Namecheap (o DNS do ALB muda!)
4. Aguarde ~15 minutos para:
   - EC2s subirem e clonar o repo
   - Backend conectar ao MySQL
   - ALB health check ficar verde
5. Carregue os dados TACO (passo 7) — o banco é novo, a tabela está vazia
6. Crie o usuário de teste (passo 8)

> **O volume EBS do banco persiste?**
> Sim — `lifecycle { prevent_destroy = true }` protege o volume `mysql-data`.
> Se o banco EC2 for recriado mas o volume existir, o script de user-data
> detecta e reutiliza o volume automaticamente (não reformata).

---

## 12. Armadilhas conhecidas

### Credenciais AWS expiradas no .env
**Sintoma:** Backend loga `Could not resolve placeholder 'AWS_ACCESS_KEY_ID'`
ou erros de S3 com `InvalidClientTokenId`.
**Causa:** Credenciais STS no `.env` expiraram.
**Solução:** O `S3Config.java` usa `DefaultCredentialsProvider` — as credenciais
vêm do `LabInstanceProfile` automaticamente. Remova qualquer `AWS_ACCESS_KEY_ID`
do `.env` e force recreate do backend:
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate backend
```

### Dispositivo EBS não encontrado (/dev/sdf)
**Sintoma:** Log do MySQL EC2: `aguardando volume EBS... (30/30)` e MySQL não sobe.
**Causa:** Instâncias `t3.*` (Nitro) expõem EBS como `/dev/nvme1n1`, não `/dev/sdf`.
**Solução:** O `user-data.sh.tpl` detecta automaticamente. Se ainda falhar, verifique
se o volume EBS foi anexado na AWS Console.

### data.sql dividindo valores repetidamente
**Sintoma:** `energiaKcal = 1.23E-78` na busca de alimentos.
**Causa:** `spring.sql.init.mode=always` fazia o `data.sql` rodar a cada restart,
e o UPDATE que divide por 100 acumulava.
**Solução:** `application-prod.properties` tem `spring.sql.init.mode=never`.
Para corrigir dados corrompidos, siga o passo 7 (TRUNCATE + recarga manual).

### fonte dos alimentos vazia — busca retorna 404
**Sintoma:** `GET /food-itens/search-part?nomeParte=arroz` retorna 404 mesmo com dados no banco.
**Causa:** MySQL inseriu `fonte = ''` (não NULL) porque o INSERT do `data.sql`
não especifica a coluna `fonte`.
**Solução:** Execute manualmente:
```sql
UPDATE alimentos SET fonte = 'TACO' WHERE fonte IS NULL OR fonte = '';
```

### Hash bcrypt corrompido por interpolação de shell
**Sintoma:** Login retorna `Bad credentials` mesmo com hash no banco.
**Causa:** Copiar `$2b$10$...` para variável bash faz `$2` ser interpretado como
argumento posicional (resulta em `b10$...` — hash inválido).
**Solução:** Sempre gere e aplique o hash no próprio servidor (via SSM + Python),
nunca via interpolação local. Ver passo 8.

### ALB retorna 403 em assets estáticos
**Sintoma:** Imagens do frontend retornam `403 Forbidden`.
**Causa:** Build Vite copia arquivos da pasta `public/` com permissão `600`;
o worker nginx não consegue ler.
**Solução:** O `frontend/Dockerfile` já tem o fix (`chmod -R 644`).
Se ocorrer em container já rodando:
```bash
docker exec frontend chmod -R 644 /usr/share/nginx/html
```

### CORS bloqueando chamadas da API
**Sintoma:** Console do browser mostra `CORS policy: No 'Access-Control-Allow-Origin'`.
**Causa:** Domínio de produção não estava na lista `allowedOrigins` do `SecurityConfig`.
**Solução:** Verifique `SecurityConfig.java` — deve conter `https://fittnutri.site`
e `https://www.fittnutri.site` na lista.

### git dubious ownership no servidor via SSM
**Sintoma:** `fatal: detected dubious ownership in repository`.
**Causa:** SSM roda como `root`, mas o repo foi clonado pelo usuário `ubuntu`.
**Solução:** Use `sudo -u ubuntu git ...` em todos os comandos git nos scripts SSM.

---

## Referência rápida de instâncias

Após o `terraform apply`, anote os IDs das instâncias:

```bash
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].[InstanceId,Tags[?Key=='Name'].Value|[0]]" \
  --output table
```

| Tag Name                     | Uso                              |
|------------------------------|----------------------------------|
| `fittnutri-ec2-prod`         | Servidor de app (backend+frontend+nginx) |
| `fittnutri-db-ec2-prod`      | Banco de dados MySQL             |
| `fittnutri-monitoring-ec2-prod` | Prometheus + Grafana          |
