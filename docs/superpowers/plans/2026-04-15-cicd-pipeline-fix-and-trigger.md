# CI/CD Pipeline — Fix e Disparo Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir dois bugs críticos que fariam o pipeline falhar e disparar o `main.yml` com sucesso.

**Architecture:** Dois fixes independentes — um no backend (profile de teste H2) e um no pipeline YAML (nome incorreto da variável Vite). Após os fixes, um push para `main` dispara o pipeline automaticamente.

**Tech Stack:** Spring Boot 3.5.5 · JUnit 5 · H2 · Vite 7 · GitHub Actions

---

## Bugs identificados pela análise (pre-flight)

### Bug 1 — Backend CI vai falhar no `DemoApplicationTests`

**Causa raiz:** `DemoApplicationTests` usa `@SpringBootTest`, que carrega o contexto completo do Spring.
O pipeline passa `-Dspring.profiles.active=local`, mas **não existe `application-local.properties`**.
O Spring vai cair no fallback do `application.properties`, que aponta para `localhost:3306` (MySQL) — inexistente no runner do GitHub Actions.

**Sintoma esperado no log:**
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**Fix:** Criar `src/test/resources/application.properties` com datasource H2 em memória.
Isso sobrescreve automaticamente as properties de produção durante qualquer execução de teste, sem precisar passar flags no Maven.

---

### Bug 2 — Frontend build não vai injetar a URL da API corretamente

**Causa raiz:** O secret no GitHub foi criado como `VITE_API_URL`, mas o código (`frontend/src/utils/api.js`) lê `VITE_API_BASE_URL`. O pipeline passa a variável com o nome errado para o step de build.

**Arquivo afetado:** `.github/workflows/main.yml`, step "Build de produção (Vite)"

```yaml
# ERRADO (nome do secret no GitHub)
VITE_API_URL: ${{ secrets.VITE_API_URL }}

# CORRETO (nome que o código lê)
VITE_API_BASE_URL: ${{ secrets.VITE_API_URL }}
```

**Observação importante:** `frontend/.env.production` já tem `VITE_API_BASE_URL=/api` hardcoded.
Durante o build Docker o Vite usa esse arquivo. A variável do pipeline é útil para sobrescrever esse valor — mas só funciona se o nome bater.

---

## Arquivos a modificar

| Arquivo | Ação |
|---|---|
| `backend/src/test/resources/application.properties` | **Criar** — H2 config para testes |
| `.github/workflows/main.yml` | **Editar** — corrigir nome da env var Vite |

---

## Task 1 — Criar properties de teste com H2

**Arquivos:**
- Criar: `backend/src/test/resources/application.properties`

- [ ] **Step 1: Criar o diretório de resources de teste**

```bash
mkdir -p backend/src/test/resources
```

- [ ] **Step 2: Criar o arquivo `application.properties` de teste**

Conteúdo completo:

```properties
# ============================================================
# Properties exclusivas para execução de testes (CI e local)
# Sobrescreve application.properties principal durante mvn test
# ============================================================

# H2 em memória — sem dependência de MySQL
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA — H2 cria o schema automaticamente
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.show-sql=false

# Desabilitar inicialização de data.sql nos testes (evita falhas de INSERT)
spring.sql.init.mode=never
spring.jpa.defer-datasource-initialization=false

# JWT — valor fixo para testes (não usa secret do ambiente)
jwt.secret=test-secret-key-for-ci-only-minimum-32-characters-long
jwt.validity=3600000

# AES — valor fixo para testes
app.aes-key=dGVzdC1hZXMta2V5LTMyY2hhcnMhISEhISE=

# Desabilitar migração de CPF nos testes
app.run-cpf-migration=false

# Desabilitar RabbitMQ nos testes (sem broker disponível no CI)
spring.autoconfigure.exclude=\
  org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration

# Desabilitar AWS S3 nos testes
cloud.aws.stack.auto=false
cloud.aws.region.auto=false

# Frontend URL (para testes de CORS)
frontend.url=http://localhost:5173

# Actuator
management.endpoints.web.exposure.include=health
```

- [ ] **Step 3: Verificar se DemoApplicationTests sobe com H2**

```bash
cd backend
mvn test -pl . -Dtest=DemoApplicationTests -Dsurefire.failIfNoSpecifiedTests=false
```

Saída esperada:
```
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

- [ ] **Step 4: Rodar a suite completa de testes**

```bash
mvn -B clean verify
```

Saída esperada:
```
[INFO] BUILD SUCCESS
[INFO] Tests run: X, Failures: 0, Errors: 0
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/test/resources/application.properties
git commit -m "test: adicionar application.properties com H2 para testes no CI"
```

---

## Task 2 — Corrigir nome da variável Vite no pipeline

**Arquivos:**
- Modificar: `.github/workflows/main.yml` (step "Build de produção (Vite)")

- [ ] **Step 1: Localizar o step incorreto no pipeline**

```bash
grep -n "VITE_API_URL" .github/workflows/main.yml
```

Saída esperada (linha ~155):
```
155:          VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

- [ ] **Step 2: Corrigir o nome da variável de ambiente**

No arquivo `.github/workflows/main.yml`, alterar:

```yaml
# ANTES
        env:
          NODE_OPTIONS: '--max-old-space-size=1024'
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

Para:

```yaml
# DEPOIS
        env:
          NODE_OPTIONS: '--max-old-space-size=1024'
          VITE_API_BASE_URL: ${{ secrets.VITE_API_URL }}
```

- [ ] **Step 3: Verificar que não há outras ocorrências do nome errado**

```bash
grep -n "VITE_API_URL" .github/workflows/main.yml
```

Saída esperada: nenhuma ocorrência com o nome errado restante.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/main.yml
git commit -m "fix: corrigir nome da variável VITE_API_BASE_URL no pipeline CI"
```

---

## Task 3 — Disparar o pipeline com push para main

- [ ] **Step 1: Confirmar que está na branch correta**

```bash
git branch
```

Esperado: `* main` ou `* claude-test` (vai fazer push para main via merge)

- [ ] **Step 2: Push para main (dispara o pipeline)**

```bash
git push origin main
```

- [ ] **Step 3: Monitorar a execução no GitHub**

```bash
gh run list --limit 5
```

Ou acesse: `https://github.com/Grupo-6-ADS-B/FittNutri/actions`

- [ ] **Step 4: Acompanhar logs do job backend-ci**

```bash
gh run watch
```

Verificar:
- `Executar testes com cobertura JaCoCo` → deve passar
- `OWASP Dependency-Check` → pode demorar ~5min na primeira execução
- `Build e push da imagem Docker (backend)` → push para ghcr.io

- [ ] **Step 5: Acompanhar logs do job frontend-ci**

Verificar:
- `Lint — ESLint` → sem erros
- `Build de produção (Vite)` → `VITE_API_BASE_URL` injetado corretamente
- `Verificar assets de saída` → `dist/index.html` presente

---

## Checklist de validação final

- [ ] `DemoApplicationTests` passa com H2 (sem MySQL no runner)
- [ ] Todos os testes de controller e service passam
- [ ] `VITE_API_BASE_URL` é lido corretamente no build Vite
- [ ] `dist/index.html` gerado no job frontend-ci
- [ ] Imagens Docker publicadas no ghcr.io
- [ ] Pipeline verde no GitHub Actions
