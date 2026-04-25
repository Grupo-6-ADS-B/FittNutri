# Guia de Implementação — Pipeline CI/CD FittNutri

## Visão geral

O arquivo `.github/workflows/main.yml` implementa um pipeline de três jobs que cobre
testes, segurança, build de imagens Docker e deploy automático na branch `main`.

```
push/PR
   │
   ├─► backend-ci ─────────────────────────────────────────────────────────┐
   │     JDK 21 → mvn verify (H2) → JaCoCo report → OWASP CVE scan        │
   │     → docker build → push ghcr.io                                     ├─► deploy (main only)
   │                                                                        │     SSH EC2 → docker pull
   └─► frontend-ci ────────────────────────────────────────────────────────┘     → docker compose up
         Node 20 → npm ci → eslint → vite build → npm audit                      → health-check
         → docker build → push ghcr.io
```

---

## Pré-requisitos

### 1. Secrets obrigatórios no repositório GitHub

Acesse **Settings → Secrets and variables → Actions → New repository secret**
e cadastre todos os segredos abaixo:

| Secret | Descrição |
|---|---|
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
| `MYSQL_PASSWORD` | Senha do MySQL (usada no docker-compose em produção) |
| `MYSQL_ROOT_PASSWORD` | Senha root do MySQL |
| `AWS_ACCESS_KEY_ID` | Chave de acesso IAM para o EC2/S3 |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta IAM |
| `AWS_REGION` | Região AWS (ex: `us-east-1`) |
| `AWS_S3_BUCKET` | Nome do bucket S3 |
| `EC2_HOST` | IP público ou DNS do servidor EC2 |
| `EC2_USER` | Usuário SSH (geralmente `ubuntu` ou `ec2-user`) |
| `EC2_SSH_KEY` | Conteúdo da chave privada `.pem` (começa com `-----BEGIN`) |
| `NVD_API_KEY` | Chave da NVD para o OWASP Dependency-Check (gratuita em nvd.nist.gov) |
| `VITE_API_URL` | URL do backend acessível pelo browser (ex: `https://api.fittnutri.duckdns.org`) |

> **Dica de segurança:** nunca commite nenhum desses valores no código-fonte.
> O arquivo `.env` já está no `.gitignore`; mantenha assim.

---

### 2. Configurar o ambiente `production` (proteção de deploy)

1. Vá em **Settings → Environments → New environment** → nome: `production`
2. Adicione a regra **Required reviewers** com seu usuário
3. Isso garante que nenhum deploy em produção ocorra sem aprovação manual

---

### 3. Preparar o servidor EC2

Execute os comandos abaixo na instância EC2 **antes** do primeiro deploy:

```bash
# Instalar Docker e Docker Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER

# Clonar o repositório na instância
git clone https://github.com/<seu-usuario>/FittNutri.git ~/fittnutri
cd ~/fittnutri

# Criar o arquivo .env de produção
cp .env.example .env
nano .env   # preencher com as variáveis reais
```

---

## Como o pipeline funciona

### Job `backend-ci`

| Etapa | O que faz |
|---|---|
| Setup JDK 21 | Configura Temurin 21 com cache do Maven |
| `mvn clean verify` | Compila + roda todos os testes JUnit com perfil `local` (H2 em memória) |
| JaCoCo report | Gera relatório HTML de cobertura em `target/site/jacoco/` |
| OWASP Dependency-Check | Faz scan das dependências Maven; **quebra o build** se encontrar CVE com CVSS ≥ 7 |
| Docker build + push | Constrói a imagem multi-stage e faz push para `ghcr.io` |

> O profile `local` do Spring Boot usa H2 em memória, então os testes **não precisam
> de MySQL** rodando no CI. Isso é intencional e correto.

### Job `frontend-ci`

| Etapa | O que faz |
|---|---|
| Setup Node 20 | Configura Node com cache do npm |
| `npm ci` | Instalação reproduzível (usa `package-lock.json`) |
| ESLint | Lint do código — falha em erros, não em warnings |
| `npm run build` | Build Vite de produção com `NODE_OPTIONS=--max-old-space-size=1024` |
| Verificação de assets | Confirma que `dist/index.html` foi gerado |
| `npm audit --audit-level=high` | Auditoria de segurança; falhas são registradas mas **não bloqueiam** |
| Docker build + push | Constrói imagem nginx-based e faz push para `ghcr.io` |

### Job `deploy`

Executado **apenas** quando:
- O evento é um `push` (não PR)
- A branch é `main`
- Ambos `backend-ci` e `frontend-ci` passaram

Sequência no EC2:
1. Autentica no GHCR
2. Faz `git pull` no servidor
3. Baixa as imagens `latest` do backend e frontend
4. Executa `docker compose up -d --remove-orphans`
5. Remove imagens antigas
6. Faz health-check em `/actuator/health` — falha se não retornar 200

---

## Tags de imagem geradas

Cada build gera até três tags automaticamente:

| Condição | Tag gerada |
|---|---|
| Qualquer push | `sha-<7 chars do commit>` |
| Push para `main` ou `dev` | `main` ou `dev` |
| Push para `main` | `latest` |

Exemplo: `ghcr.io/<usuario>/fittnutri-backend:latest`

---

## Segurança (OWASP)

O plugin `dependency-check-maven` já está configurado no `pom.xml`:

```xml
<failBuildOnCVSS>7</failBuildOnCVSS>
<skipTestScope>true</skipTestScope>
<formats>HTML, JSON</formats>
```

O pipeline salva o relatório como artefato por **14 dias**. Para rodar localmente:

```bash
cd backend
mvn dependency-check:check -DnvdApiKey=<sua-chave>
```

---

## Testando o pipeline localmente com `act`

```bash
# Instalar act (https://github.com/nektos/act)
brew install act

# Simular um push para main
act push --secret-file .env.secrets --job backend-ci
```

---

## Troubleshooting comum

| Problema | Solução |
|---|---|
| OWASP falha na primeira execução | Normal — o NVD pode demorar. Adicione `NVD_API_KEY` para aumentar o rate limit |
| `npm audit` bloqueia o build | Altere `continue-on-error: true` temporariamente enquanto corrige as CVEs |
| Health-check falha | Aumente o `sleep 30` para `sleep 60` se o backend demorar mais para subir |
| Push de imagem falha | Verifique se o pacote GitHub do repositório é público ou se `GITHUB_TOKEN` tem permissão de escrita |
