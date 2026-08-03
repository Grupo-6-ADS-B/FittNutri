# Pipeline CI/CD — FittNutri

**Data do documento:** 2026-04-25  
**Última atualização:** 2026-04-25  
**Workflows:** `.github/workflows/main.yml` · `.github/workflows/terraform.yml`

---

## Índice

1. [O que é CI/CD?](#1-o-que-é-cicd)
2. [Dois workflows separados](#2-dois-workflows-separados)
3. [Workflow 1 — CI (automático)](#3-workflow-1--ci-automático)
4. [Job 1 — Backend CI](#4-job-1--backend-ci)
5. [Job 2 — Frontend CI](#5-job-2--frontend-ci)
6. [O que é o OWASP Dependency-Check?](#6-o-que-é-o-owasp-dependency-check)
7. [O que é JaCoCo e cobertura de testes?](#7-o-que-é-o-jacoco-e-cobertura-de-testes)
8. [O que é o GHCR e a imagem Docker?](#8-o-que-é-o-ghcr-e-a-imagem-docker)
9. [Workflow 2 — Terraform (deploy manual)](#9-workflow-2--terraform-deploy-manual)
10. [Por que o deploy não é automático?](#10-por-que-o-deploy-não-é-automático)
11. [Onde ficam os segredos?](#11-onde-ficam-os-segredos)
12. [Status atual do pipeline](#12-status-atual-do-pipeline)
13. [Como interpretar uma execução no GitHub](#13-como-interpretar-uma-execução-no-github)

---

## 1. O que é CI/CD?

**CI** significa **Integração Contínua** (Continuous Integration). É a prática de automatizar a verificação do código sempre que alguém envia uma alteração para o repositório. O objetivo é descobrir erros o mais cedo possível — antes de o código chegar em produção.

**CD** significa **Entrega Contínua** (Continuous Delivery). É a extensão do CI: depois que o código é verificado e aprovado, ele é colocado em produção — de forma automática ou com um clique manual.

**No FittNutri:**

| Etapa | O que faz | Como é acionado |
|---|---|---|
| **CI** | Testa, analisa segurança e empacota a aplicação | Automático a cada `git push` |
| **CD** | Provisiona a infraestrutura AWS e sobe a aplicação | Manual — botão no GitHub Actions |

---

## 2. Dois workflows separados

O projeto usa **dois arquivos de workflow** com responsabilidades distintas:

```
.github/workflows/
├── main.yml        → CI (automático) — testes, segurança, Docker
└── terraform.yml   → CD (manual)    — infraestrutura AWS via Terraform
```

### main.yml — roda automaticamente

Disparado a cada `push` ou `pull_request`:

```yaml
on:
  push:
    branches: [ main, claude-test ]
  pull_request:
    branches: [ main ]
```

> **A branch `dev` não dispara o pipeline.** O time usa a `dev` com Docker Desktop localmente — push na `dev` não aciona nenhuma verificação automática.

### terraform.yml — roda manualmente

Disparado apenas quando alguém clica em **Run workflow** na aba Actions:

```yaml
on:
  workflow_dispatch:
    inputs:
      action:
        type: choice
        options: [ plan, apply, destroy ]
```

---

## 3. Workflow 1 — CI (automático)

Quando um `git push` acontece, o GitHub Actions cria uma **máquina virtual Ubuntu** temporária e executa dois jobs em paralelo:

```
git push
    │
    ▼
GitHub Actions — main.yml
    │
    ├─────────────────────────────────┐
    │                                 │
    ▼                                 ▼
┌──────────────────┐         ┌──────────────────────┐
│   backend-ci     │         │     frontend-ci       │
│                  │         │                       │
│ 1. Checkout      │         │ 1. Checkout           │
│ 2. JDK 21        │         │ 2. Node.js 20         │
│ 3. Testes JUnit  │         │ 3. npm ci             │
│ 4. JaCoCo        │         │ 4. ESLint             │
│ 5. OWASP         │         │ 5. Build Vite         │
│ 6. Docker build  │         │ 6. Verificar dist/    │
│    + push GHCR   │         │ 7. npm audit          │
│  (main/claude-   │         │ 8. Docker build       │
│   test apenas)   │         │    + push GHCR        │
└──────────────────┘         │  (main/claude-test)   │
         │                   └──────────────────────┘
         │                             │
         └──────────┬──────────────────┘
                    │
                    ▼
            Pipeline CI concluído ✅

```

> **Regra do push Docker:** as imagens só são enviadas ao GHCR em push para `main` ou `claude-test`. Na `dev` e em pull requests, o build é feito mas a imagem não é publicada — serve apenas para verificar que o Dockerfile está correto.

Cada etapa dentro de um job é chamada de **step**. Se qualquer step falhar, o job para imediatamente e é marcado como falho.

---

## 4. Job 1 — Backend CI

Valida o código Java do Spring Boot. Roda dentro da pasta `backend/`.

### Step 1 — Checkout

```yaml
- name: Checkout do código
  uses: actions/checkout@v4
```

Baixa uma cópia do repositório na máquina virtual. Sem isso, não há código para compilar.

---

### Step 2 — Instalar JDK 21

```yaml
- name: Configurar JDK 21
  uses: actions/setup-java@v4
  with:
    java-version: '21'
    distribution: 'temurin'
    cache: maven
```

Instala o Java 21 (distribuição Temurin). O `cache: maven` guarda as dependências do Maven entre execuções — evita baixar centenas de JARs do zero a cada push.

---

### Step 3 — Executar testes + JaCoCo

```yaml
- name: Executar testes com cobertura JaCoCo
  run: |
    mvn -B clean verify \
      -Dspring.profiles.active=local \
      -DJWT_SECRET=${{ secrets.JWT_SECRET }} \
      -Dmaven.test.failure.ignore=false
```

- `mvn clean verify` compila o projeto e roda todos os testes JUnit
- `-Dspring.profiles.active=local` ativa o perfil `local`, que usa banco **H2 em memória** — sem precisar de MySQL no CI
- `-DJWT_SECRET` injeta o segredo JWT (vem do GitHub Secrets)
- `-Dmaven.test.failure.ignore=false` garante que qualquer teste com falha **para o pipeline**

---

### Step 4 — Publicar relatório JaCoCo

```yaml
- name: Publicar relatório de cobertura JaCoCo
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: jacoco-report
    path: backend/target/site/jacoco/
    retention-days: 7
```

Salva o relatório HTML de cobertura como artefato disponível por 7 dias. O `if: always()` garante que o relatório é salvo mesmo quando os testes falham.

---

### Step 5 — OWASP Dependency-Check

```yaml
- name: OWASP Dependency-Check (CVSS ≥ 7)
  run: |
    mvn -B dependency-check:check \
      -DnvdApiKey="${{ secrets.NVD_API_KEY }}" \
      -DfailBuildOnCVSS=7 \
      -DskipTestScope=true \
      -DfailOnError=false
  continue-on-error: true
```

Verifica vulnerabilidades de segurança nas dependências. Veja a seção [6. O que é o OWASP?](#6-o-que-é-o-owasp-dependency-check) para explicação completa.

---

### Step 6 — Build e push Docker (backend)

```yaml
- name: Build e push da imagem Docker (backend)
  uses: docker/build-push-action@v5
  with:
    push: ${{ github.event_name != 'pull_request' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/claude-test') }}
    tags: ${{ steps.meta-backend.outputs.tags }}
```

Constrói a imagem Docker e envia ao GHCR apenas em `main` e `claude-test`.

---

## 5. Job 2 — Frontend CI

Valida o código React + Vite. Roda dentro da pasta `frontend/`.

### Step 1 — Checkout

Igual ao backend — baixa o código na máquina virtual.

---

### Step 2 — Instalar Node.js 20

```yaml
- name: Configurar Node.js 20
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
```

Instala o Node.js 20. O `cache: 'npm'` reutiliza dependências entre execuções usando o `package-lock.json` como chave.

---

### Step 3 — npm ci

```yaml
- name: Instalar dependências (npm ci)
  run: npm ci
```

`npm ci` instala as dependências usando exatamente as versões travadas no `package-lock.json` — garante reprodutibilidade total entre ambientes.

---

### Step 4 — ESLint

```yaml
- name: Lint — ESLint
  run: npm run lint
  continue-on-error: false
```

Analisa o código JavaScript/JSX em busca de erros e más práticas. Se encontrar problemas, o pipeline para.

**Exemplos do que o ESLint detecta:**
- Variáveis declaradas mas nunca usadas
- `console.log()` esquecidos
- Importações duplicadas
- Uso de `var` em vez de `const`/`let`

---

### Step 5 — Build de produção (Vite)

```yaml
- name: Build de produção (Vite)
  run: npm run build
  env:
    NODE_OPTIONS: '--max-old-space-size=1024'
    VITE_API_BASE_URL: ${{ secrets.VITE_API_URL }}
```

Gera os arquivos estáticos em `dist/`. A URL da API do backend é injetada no build via secret.

---

### Step 6 — Verificar assets gerados

```yaml
- name: Verificar assets de saída
  run: |
    test -f dist/index.html || (echo "ERRO: index.html não encontrado" && exit 1)
```

Confirma que o `index.html` foi gerado. Se não existir, o pipeline para.

---

### Step 7 — Publicar artefato do build

```yaml
- name: Publicar artefato do build (dist/)
  uses: actions/upload-artifact@v4
  with:
    name: frontend-dist
    path: frontend/dist/
    retention-days: 3
```

Salva o conteúdo da pasta `dist/` por 3 dias. Útil para inspecionar o resultado sem rodar localmente.

---

### Step 8 — npm audit

```yaml
- name: Auditoria de segurança (npm audit)
  run: npm audit --audit-level=high
  continue-on-error: true
```

Verifica vulnerabilidades nas dependências npm. Não bloqueia o pipeline — apenas registra para análise.

---

### Step 9 — Build e push Docker (frontend)

Igual ao backend: constrói e envia a imagem ao GHCR apenas em `main` e `claude-test`.

---

## 6. O que é o OWASP Dependency-Check?

### O problema que ele resolve

Todo projeto usa **dependências** — bibliotecas de terceiros. O FittNutri usa dezenas: Spring Boot, Hibernate, JWT, AWS SDK, etc. Qualquer uma pode ter uma vulnerabilidade descoberta a qualquer momento.

Quando isso acontece, a vulnerabilidade recebe um código **CVE** (Common Vulnerabilities and Exposures) e uma nota **CVSS** (0 a 10) que indica a gravidade:

| CVSS | Classificação |
|---|---|
| 0.0 – 3.9 | Baixo |
| 4.0 – 6.9 | Médio |
| 7.0 – 8.9 | Alto |
| 9.0 – 10.0 | Crítico |

### Como funciona

```
pom.xml  →  lista todas as dependências
                │
                ▼
     Banco NVD (nvd.nist.gov)
     (mantido pelo governo dos EUA)
                │
                ▼
   Compara versões com CVEs conhecidos
                │
                ▼
   Relatório HTML + decisão de bloquear
```

### Configuração no FittNutri

| Parâmetro | Significado |
|---|---|
| `nvdApiKey` | Chave de API para o NVD — acelera o download do banco de CVEs |
| `failBuildOnCVSS=7` | CVE com nota ≥ 7.0 **bloqueia o pipeline** |
| `skipTestScope=true` | Ignora dependências só usadas em testes (JUnit, Mockito) |
| `failOnError=false` | Instabilidade do NVD não derruba o build |

O relatório é salvo como artefato por **14 dias** e pode ser aberto no navegador — mostra nome da dependência, versão vulnerável, nota CVSS e link para o CVE oficial.

### O que é OWASP?

**Open Web Application Security Project** — organização sem fins lucrativos focada em segurança de software. Mantêm o **OWASP Top 10**, lista das 10 vulnerabilidades mais críticas em aplicações web. O Dependency-Check é uma das ferramentas gratuitas que eles disponibilizam.

---

## 7. O que é o JaCoCo e cobertura de testes?

**JaCoCo** (Java Code Coverage) mede quanto do código Java foi exercitado pelos testes automatizados.

### Como funciona

O JaCoCo instrumenta o bytecode Java durante os testes, inserindo contadores em cada linha. Ao final, gera um relatório mostrando o que foi testado e o que não foi.

```
Cobertura = (linhas executadas pelos testes) / (total de linhas) × 100
```

**Exemplo:**
```java
public String classificarImc(double imc) {
    if (imc < 18.5) return "Abaixo do peso";  // ← testado ✅
    if (imc < 25.0) return "Normal";          // ← testado ✅
    if (imc < 30.0) return "Sobrepeso";       // ← NÃO testado ❌
    return "Obesidade";                       // ← NÃO testado ❌
}
// Cobertura: 50%
```

### Situação no FittNutri

O JaCoCo gera o relatório mas ainda não tem threshold mínimo configurado — um build com baixa cobertura passa normalmente. O relatório fica disponível como artefato por 7 dias.

---

## 8. O que é o GHCR e a imagem Docker?

**GHCR** (GitHub Container Registry) é o repositório de imagens Docker integrado ao GitHub. Funciona como um almoxarifado de versões empacotadas da aplicação.

```
Código fonte (Java/React)
        │
        ▼
    Dockerfile
        │
        ▼
  Imagem Docker  ──→  ghcr.io/grupo-6-ads-b/fittnutri-backend:main
                      ghcr.io/grupo-6-ads-b/fittnutri-backend:sha-a1b2c3
                      ghcr.io/grupo-6-ads-b/fittnutri-frontend:main
```

### Tags geradas

| Tag | Quando é gerada |
|---|---|
| `:main`, `:claude-test` | A cada push na branch correspondente |
| `:sha-a1b2c3` | Sempre — identifica o commit exato que gerou a imagem |
| `:latest` | Apenas em push para `main` |

A tag `:sha-a1b2c3` permite **rollback** — se uma versão quebrar produção, basta referenciar o SHA do último build estável.

### Por que empacotar em Docker?

A EC2 que o Terraform provisiona não tem Java nem Node instalados — só tem Docker. A imagem já vem com tudo dentro: o JAR compilado, as dependências, o Nginx configurado. O servidor só precisa fazer `docker compose up`.

---

## 9. Workflow 2 — Terraform (deploy manual)

O segundo workflow, `terraform.yml`, é responsável pelo **deploy da infraestrutura AWS**. Ele nunca roda sozinho — só é acionado manualmente por alguém da equipe.

### Por que é separado do CI?

O CI roda em todo push e deve ser rápido e leve. Provisionar infraestrutura AWS leva 10–15 minutos e consome credenciais que expiram. Manter os dois separados evita que um afete o outro.

### Como acionar o workflow

1. No GitHub, clique na aba **Actions**
2. No menu esquerdo, clique em **FittNutri Terraform**
3. Clique no botão **Run workflow** (canto direito)
4. Selecione a branch e a ação desejada
5. Clique em **Run workflow** (botão verde)

> O botão **Run workflow** só aparece quando o arquivo `terraform.yml` existe na branch **`main`** do repositório.

### As três ações disponíveis

| Ação | O que faz | Quando usar |
|---|---|---|
| `plan` | Mostra o que seria criado/destruído **sem aplicar nada** | Sempre — use antes de qualquer apply |
| `apply` | Provisiona toda a infraestrutura na AWS | Após revisar o plan |
| `destroy` | Destrói toda a infraestrutura | Antes de encerrar o lab |

### O que o workflow executa

```
1.  Checkout do código
2.  Configurar credenciais AWS (via secrets)
3.  Validar credenciais (aws sts get-caller-identity)
4.  Instalar Terraform 1.9.0
5.  Criar lab.tfvars a partir do secret TF_LAB_VARS
6.  terraform init  (conecta ao backend S3 para buscar o estado)
7.  terraform plan  (sempre roda)
8.  terraform apply (só se action == apply)
9.  terraform destroy (só se action == destroy)
10. Mostrar outputs (só após apply)
```

> **Node.js 24:** o workflow define `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` para garantir compatibilidade com a versão atual do runner do GitHub Actions.

### Como o lab.tfvars é criado

O secret `TF_LAB_VARS` contém o conteúdo completo do arquivo `lab.tfvars`. Durante o workflow, ele é escrito em disco usando `printf` via variável de ambiente — essa abordagem evita corrupção de caracteres especiais (`@`, `!`, `─`) que ocorre quando o conteúdo é expandido diretamente no shell:

```yaml
- name: Criar lab.tfvars a partir do secret
  env:
    TF_LAB_VARS: ${{ secrets.TF_LAB_VARS }}
  run: |
    printf '%s\n' "$TF_LAB_VARS" > terraform/contas/lab.tfvars
    head -20 terraform/contas/lab.tfvars   # exibe as primeiras 20 linhas no log
```

As credenciais AWS **não ficam no `lab.tfvars`** — elas são injetadas pelo step 2 via `configure-aws-credentials`.

---

### Estado do Terraform — backend S3

O Terraform precisa de um **arquivo de estado** (`terraform.tfstate`) para saber quais recursos já existem na AWS. Por padrão esse arquivo ficaria no runner do GitHub Actions, que é destruído ao final de cada execução — fazendo o `destroy` não encontrar nada para deletar.

Para resolver isso, o estado é armazenado em um bucket S3 dedicado:

```
Bucket: fittnutri-terraform-state-471112790525
Chave:  fittnutri/terraform.tfstate
Região: us-east-1
```

Com o backend S3 configurado, o fluxo funciona corretamente entre sessões:

```
terraform apply  → cria recursos → salva estado no S3
                                         ↓
terraform destroy → lê estado do S3 → destrói exatamente o que foi criado
```

> **Importante:** nunca delete o bucket `fittnutri-terraform-state-471112790525`. Sem ele o Terraform perde o rastreamento de todos os recursos provisionados.

---

### Fluxo a cada sessão de lab

```
Lab reiniciou → novas credenciais geradas
        │
        ▼
AWS Academy → AWS Details → copiar os 3 valores
        │
        ▼
GitHub → Settings → Secrets → atualizar:
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_SESSION_TOKEN
        │
        ▼
Actions → FittNutri Terraform → Run workflow → plan
        │
        ▼  (sem erros no plan?)
Actions → FittNutri Terraform → Run workflow → apply
        │
        ▼
Infraestrutura no ar ✅
        │
        ▼  (ao encerrar o lab)
Actions → FittNutri Terraform → Run workflow → destroy
```

> **Importante:** o `TF_LAB_VARS` é configurado uma única vez e não muda. Apenas os 3 secrets AWS precisam ser atualizados a cada sessão.

---

## 10. Por que o deploy não é automático?

### Razão 1 — EC2 em subnet privada

As instâncias ficam em **subnets privadas** da VPC — sem IP público. O GitHub Actions roda em servidores externos e nunca conseguiria alcançá-las via SSH.

```
Internet → ALB (subnet pública) → EC2 App (subnet privada)
                                          ↑
                                  Sem acesso externo
```

### Razão 2 — Credenciais de laboratório expiram

A conta AWS Academy gera credenciais temporárias que expiram a cada 4 horas. Um deploy automático exigiria credenciais sempre válidas — impossível nesse modelo.

### Razão 3 — O Terraform já é o CD

O `terraform apply` provisiona a infraestrutura **e** implanta a aplicação. Quando a EC2 sobe, ela executa automaticamente o `user-data.sh` que clona o repositório e inicia os containers. Não há necessidade de um segundo mecanismo de deploy.

---

## 11. Onde ficam os segredos?

Nenhuma senha ou chave fica no código. Tudo está nos **GitHub Secrets**:

> **GitHub → Settings → Secrets and variables → Actions**

### Secrets permanentes (configurar uma vez)

| Secret | Usado por | Descrição |
|---|---|---|
| `JWT_SECRET` | `main.yml` | Chave JWT para os testes do backend |
| `NVD_API_KEY` | `main.yml` | Chave para o banco de CVEs do OWASP |
| `VITE_API_URL` | `main.yml` | URL da API injetada no build do frontend |
| `TF_LAB_VARS` | `terraform.yml` | Conteúdo completo do `lab.tfvars` (senhas, domínio, configurações) — escrito via `printf` para preservar caracteres especiais |
| `AWS_REGION` | `terraform.yml` | Região AWS (`us-east-1`) |

### Secrets que mudam a cada sessão de lab

| Secret | Como obter |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS Academy → AWS Details → AWS CLI |
| `AWS_SECRET_ACCESS_KEY` | AWS Academy → AWS Details → AWS CLI |
| `AWS_SESSION_TOKEN` | AWS Academy → AWS Details → AWS CLI |

Os secrets são variáveis criptografadas que o GitHub injeta na máquina virtual em tempo de execução. Nunca aparecem nos logs.

---

## 12. Status atual do pipeline

### Workflow CI (`main.yml`)

| Componente | Status | Observação |
|---|---|---|
| Testes backend (JUnit) | ✅ Funcionando | Roda com H2 em memória, sem MySQL externo |
| Cobertura JaCoCo | ✅ Funcionando | Gera relatório; sem threshold mínimo definido |
| OWASP Dependency-Check | ✅ Funcionando | Relatório gerado; instabilidade da NVD não quebra o build |
| ESLint frontend | ✅ Funcionando | Bloqueia o pipeline em caso de erro |
| Build Vite | ✅ Funcionando | Gera `dist/` com os assets de produção |
| npm audit | ✅ Funcionando | Reporta vulnerabilidades sem bloquear |
| Docker build backend | ✅ Funcionando | Constrói a imagem corretamente |
| Docker build frontend | ✅ Funcionando | Constrói a imagem corretamente |
| Push GHCR | ✅ Funcionando | Envia imagens para `main` e `claude-test` |

### Workflow Terraform (`terraform.yml`)

| Componente | Status | Observação |
|---|---|---|
| Trigger manual (workflow_dispatch) | ✅ Configurado | Disponível em Actions → FittNutri Terraform |
| Validação de credenciais AWS | ✅ Configurado | Valida antes de rodar qualquer comando |
| terraform plan | ✅ Configurado | Sempre roda — mostra o que será feito |
| terraform apply | ✅ Configurado | Roda apenas quando ação `apply` é escolhida |
| terraform destroy | ✅ Configurado | Roda apenas quando ação `destroy` é escolhida |
| Backend S3 (estado) | ✅ Configurado | Estado salvo em `fittnutri-terraform-state-471112790525` |
| Credenciais AWS (lab) | ⚠️ Manual | Precisam ser atualizadas a cada ~4h no GitHub Secrets |

---

## 13. Como interpretar uma execução no GitHub

1. Acesse o repositório → aba **Actions**
2. Clique em qualquer execução listada
3. Clique no nome de um job para ver seus steps

### Lendo os ícones

```
✅ verde   → Step executou com sucesso
❌ vermelho → Step falhou (pipeline para aqui)
⚠️ amarelo → Step executou com aviso (continue-on-error: true)
⏭️ cinza   → Step foi pulado (condição if: não atendida)
```

### Baixando os relatórios gerados

Ao final de uma execução, role até a seção **Artifacts**:

| Artefato | Conteúdo | Disponível por |
|---|---|---|
| `jacoco-report` | Cobertura de testes do backend (HTML) | 7 dias |
| `owasp-report` | Vulnerabilidades de dependências (HTML) | 14 dias |
| `frontend-dist` | Build de produção do React (`dist/`) | 3 dias |

---

## Arquivos relacionados

| Arquivo | Descrição |
|---|---|
| `.github/workflows/main.yml` | Workflow de CI — testes, segurança, Docker |
| `.github/workflows/terraform.yml` | Workflow de CD — infraestrutura AWS via Terraform |
| `backend/pom.xml` | Configuração do Maven, JaCoCo e OWASP |
| `backend/Dockerfile` | Receita para construir a imagem Docker do backend |
| `frontend/Dockerfile` | Receita para construir a imagem Docker do frontend |
| `terraform/` | Infraestrutura AWS completa (VPC, EC2, ALB, RDS, etc.) |
| `Documentação/runbook-deploy-terraform.md` | Guia passo a passo do deploy via Terraform |
