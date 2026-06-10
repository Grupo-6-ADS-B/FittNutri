# One-Command-Run: Ambiente de Desenvolvimento Local

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que qualquer membro do time rode o FittNutri localmente com um único comando (`./manage.sh dev`), sem necessidade de credenciais AWS ou RabbitMQ.

**Architecture:** Criar um override `docker-compose.dev.yml` que usa perfil Spring `dev`, adicionar `application-dev.properties` com placeholders e fallbacks seguros, e um `Dockerfile.dev` para o frontend rodando com vite dev server (mantendo o proxy funcional).

**Tech Stack:** Docker Compose override, Spring Boot profiles, Vite dev server, MySQL 8, bash.

---

## Diagnóstico dos Root Causes

### RC-1 (CRÍTICO): `docker-compose.yml:33` força `prod`
```yaml
SPRING_PROFILES_ACTIVE: prod
```
O perfil `prod` carrega `application-prod.properties` que exige `${RABBITMQ_URL}` e credenciais AWS **sem fallback**. Com valores vazios no `.env`, o Spring lança `IllegalArgumentException` e o backend não sobe.

### RC-2 (ALTO): Não existe `application-dev.properties`
O `application.properties` base define `spring.profiles.active=dev`, mas não há arquivo `application-dev.properties`. Quando rodando via Docker com perfil `dev`, a URL do banco seria `localhost:3306` (do `application.properties`), mas dentro do container o MySQL é `mysql:3306`. Precisa de um arquivo dedicado com o placeholder correto.

### RC-3 (ALTO): Frontend Dockerfile produz nginx estático
O `Dockerfile` do frontend faz `npm run build` → nginx estático. O proxy do vite (`/api → http://localhost:8080`) **não existe em runtime**. O frontend buildado precisa de `VITE_API_BASE_URL` definido em tempo de build, mas o `docker-compose.yml` não passa esse ARG.

### RC-4 (MÉDIO): `manage.sh` não tem `case dev`
O comando `./manage.sh dev` não existe; o `*)` cai no `echo "Uso: ..."`.

### RC-5 (MÉDIO): `.env.example` sem valores padrão
Todos os campos obrigatórios para dev (MySQL password, JWT_SECRET, APP_AES_KEY) estão vazios. O time não sabe o que preencher para apenas rodar localmente.

---

## Mapa de Arquivos

| Ação | Arquivo | Responsabilidade |
|------|---------|-----------------|
| **Criar** | `docker-compose.dev.yml` | Override para dev: perfil `dev`, build local, sem nginx/certbot/prometheus/grafana |
| **Criar** | `backend/src/main/resources/application-dev.properties` | Config Spring para dev: MySQL via `${SPRING_DATASOURCE_URL}`, sem RabbitMQ/S3, logs verbose |
| **Criar** | `.env.dev` | Valores padrão seguros para desenvolvimento local (não commitar) |
| **Criar** | `frontend/Dockerfile.dev` | Dockerfile para dev: roda `npm run dev` (vite dev server com proxy) |
| **Modificar** | `manage.sh` | Adicionar `case dev)` que executa `docker-compose -f docker-compose.dev.yml up --build` |
| **Modificar** | `README.md` | Seção "Rodando Localmente em 3 Passos" |

---

## Tarefas

### Tarefa 1: Criar `application-dev.properties`

**Arquivos:**
- Criar: `backend/src/main/resources/application-dev.properties`

- [ ] **Passo 1: Criar o arquivo de perfil dev**

```properties
# ==========================================
# PERFIL DEV — ambiente de desenvolvimento local via Docker
# ==========================================

# MySQL — usa variável de ambiente injetada pelo docker-compose.dev.yml
# Fallback para conexão direta (sem Docker) aponta para localhost
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/fittnutri?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8&useUnicode=true}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:root}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA — DDL automático habilitado em dev para facilitar o desenvolvimento
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# Logs — verbose em dev para facilitar debug
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.fitt_nutri=DEBUG

# Actuator — expor tudo em dev para inspeção
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always

# Swagger — habilitado em dev
springdoc.swagger-ui.enabled=true
springdoc.api-docs.enabled=true

# NOTA: RabbitMQ e AWS S3 são @Profile("prod") — não são instanciados neste perfil.
# PDFs via async NÃO estão disponíveis em dev. Isso é esperado.
```

- [ ] **Passo 2: Verificar que o perfil `dev` não carrega beans de prod**

Confirmar no código que `S3Service`, `PdfConsumerService` e `PdfProducerService` têm `@Profile("prod")`:

```bash
grep -r "@Profile" backend/src/main/java --include="*.java"
```

Saída esperada: linhas com `@Profile("prod")` nos serviços AWS/RabbitMQ.

- [ ] **Passo 3: Commit**

```bash
git add backend/src/main/resources/application-dev.properties
git commit -m "feat: adicionar perfil dev para ambiente local sem AWS/RabbitMQ"
```

---

### Tarefa 2: Criar `docker-compose.dev.yml`

**Arquivos:**
- Criar: `docker-compose.dev.yml`

- [ ] **Passo 1: Criar o arquivo docker-compose de desenvolvimento**

```yaml
# docker-compose.dev.yml
# Ambiente de desenvolvimento local — "One-Command-Run"
# Uso: ./manage.sh dev
#
# O que este arquivo faz diferente do docker-compose.yml:
#   - Usa perfil Spring "dev" (sem RabbitMQ e sem AWS S3)
#   - Builda as imagens localmente (não precisa do ECR)
#   - Roda frontend com vite dev server (proxy /api → backend funciona)
#   - Remove nginx, certbot, prometheus e grafana (desnecessários localmente)
#   - Usa .env.dev com valores padrão seguros para desenvolvimento

services:
  mysql:
    image: mysql:8.0
    container_name: mysql-dev
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-fittnutri}
    volumes:
      - mysql_dev_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    networks:
      - fittnutri-dev-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD:-root}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend-dev
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/${MYSQL_DATABASE:-fittnutri}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8&useUnicode=true
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME:-root}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD:-root}
      JWT_SECRET: ${JWT_SECRET:-dev-jwt-secret-insecure-change-in-prod}
      JWT_VALIDITY: ${JWT_VALIDITY:-86400000}
      APP_AES_KEY: ${APP_AES_KEY:-dev-aes-key-32chars-insecure!!}
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:5173}
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - fittnutri-dev-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: frontend-dev
    restart: unless-stopped
    environment:
      VITE_API_TARGET: http://backend:8080
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - fittnutri-dev-network

volumes:
  mysql_dev_data:

networks:
  fittnutri-dev-network:
    driver: bridge
```

- [ ] **Passo 2: Verificar que o diretório `mysql/init` existe (para scripts de inicialização)**

```bash
ls mysql/init/ 2>/dev/null || echo "Diretório mysql/init não existe — será criado vazio"
```

Se não existir:
```bash
mkdir -p mysql/init
```

- [ ] **Passo 3: Commit**

```bash
git add docker-compose.dev.yml
git add mysql/init/.gitkeep 2>/dev/null || true
git commit -m "feat: adicionar docker-compose.dev.yml para ambiente local sem dependências AWS"
```

---

### Tarefa 3: Criar `frontend/Dockerfile.dev`

**Arquivos:**
- Criar: `frontend/Dockerfile.dev`

Este Dockerfile roda o vite dev server (não faz build estático), então o proxy `/api → VITE_API_TARGET` funciona em runtime.

- [ ] **Passo 1: Criar o Dockerfile de desenvolvimento do frontend**

```dockerfile
# Dockerfile.dev — Frontend em modo desenvolvimento
# Usa vite dev server com hot reload e proxy /api → backend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# VITE_API_TARGET é injetado pelo docker-compose.dev.yml
# O vite.config.js lê process.env.VITE_API_TARGET para configurar o proxy
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

- [ ] **Passo 2: Verificar que `vite.config.js` usa `process.env.VITE_API_TARGET`**

```bash
grep -n "VITE_API_TARGET" frontend/vite.config.js
```

Saída esperada: `target: process.env.VITE_API_TARGET || 'http://localhost:8080'`

O arquivo já usa essa variável (linha 13), então nenhuma modificação é necessária no vite.config.js.

- [ ] **Passo 3: Commit**

```bash
git add frontend/Dockerfile.dev
git commit -m "feat: adicionar Dockerfile.dev do frontend com vite dev server"
```

---

### Tarefa 4: Criar `.env.dev`

**Arquivos:**
- Criar: `.env.dev`

- [ ] **Passo 1: Criar `.env.dev` com valores seguros para desenvolvimento**

```env
# ============================================================
# FittNutri — Variáveis de Ambiente para DESENVOLVIMENTO LOCAL
# ============================================================
# Este arquivo contém valores INSEGUROS propositalmente.
# Use APENAS localmente. Nunca use esses valores em produção.
# Para produção, use o .env.example como base e defina valores reais.
# ============================================================

# --- MySQL ---
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=fittnutri
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

# --- JWT (inseguro — apenas para dev) ---
JWT_SECRET=dev-jwt-secret-insecure-change-in-prod-min-32chars
JWT_VALIDITY=86400000

# --- Criptografia AES (deve ter EXATAMENTE 32 caracteres) ---
APP_AES_KEY=dev-aes-key-32chars-insecure!!

# --- AWS S3 (não necessário em dev — perfil dev não instancia S3Service) ---
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# --- RabbitMQ (não necessário em dev — perfil dev não instancia PdfConsumerService) ---
RABBITMQ_URL=

# --- Frontend ---
FRONTEND_URL=http://localhost:5173

# --- Grafana (não sobe em dev) ---
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

- [ ] **Passo 2: Garantir que `.env.dev` está no `.gitignore`**

```bash
grep ".env.dev" .gitignore || echo ".env.dev" >> .gitignore
```

- [ ] **Passo 3: Commit**

```bash
git add .env.dev .gitignore
git commit -m "feat: adicionar .env.dev com valores padrão para desenvolvimento local"
```

---

### Tarefa 5: Atualizar `manage.sh`

**Arquivos:**
- Modificar: `manage.sh`

- [ ] **Passo 1: Adicionar comando `dev` no `manage.sh`**

Localizar o bloco `case $ACTION in` e adicionar o case `dev)` ANTES do `*)`:

```bash
  dev)
    echo "Iniciando ambiente de DESENVOLVIMENTO local..."
    echo "Usando: docker-compose.dev.yml + .env.dev"
    
    # Cria .env.dev se não existir
    if [ ! -f .env.dev ]; then
      echo "AVISO: .env.dev não encontrado. Criando a partir dos valores padrão..."
      cp .env.dev.example .env.dev 2>/dev/null || echo "Erro: .env.dev.example não encontrado. Crie o arquivo .env.dev manualmente."
      exit 1
    fi
    
    docker compose -f docker-compose.dev.yml --env-file .env.dev down
    docker compose -f docker-compose.dev.yml --env-file .env.dev up --build
    ;;
```

Também atualizar a linha `echo "Uso:"` para incluir `dev`:
```bash
    echo "Uso: ./manage.sh {dev|start|stop|restart|build|rebuild|logs [service]|status}"
```

- [ ] **Passo 2: Verificar que o script ficou correto**

```bash
bash -n manage.sh && echo "Sintaxe OK"
```

Saída esperada: `Sintaxe OK`

- [ ] **Passo 3: Garantir permissão de execução**

```bash
chmod +x manage.sh
```

- [ ] **Passo 4: Commit**

```bash
git add manage.sh
git commit -m "feat: adicionar comando 'dev' no manage.sh para ambiente local one-command-run"
```

---

### Tarefa 6: Atualizar `README.md`

**Arquivos:**
- Modificar: `README.md` (criar se não existir)

- [ ] **Passo 1: Verificar se README.md existe e ler o conteúdo atual**

```bash
cat README.md 2>/dev/null || echo "README não existe"
```

- [ ] **Passo 2: Adicionar ou criar a seção "Rodando Localmente"**

Inserir a seguinte seção no início do README.md (ou criar o arquivo):

```markdown
## Rodando Localmente (One-Command-Run)

> **Pré-requisitos:** Docker e Docker Compose instalados.

### 3 Passos e a Mágica Acontece

**Passo 1 — Clone o repositório:**
```bash
git clone <url-do-repositório>
cd FittNutri
```

**Passo 2 — O arquivo `.env.dev` já existe com valores padrão seguros.**  
Se precisar customizar (ex: trocar porta do MySQL), edite `.env.dev`.

**Passo 3 — Suba tudo:**
```bash
./manage.sh dev
```

Isso vai:
1. Buildar o backend (Spring Boot + perfil `dev`, sem AWS/RabbitMQ)
2. Buildar o frontend (Vite dev server com hot reload)
3. Subir o MySQL com o schema inicial
4. Conectar tudo na rede Docker interna

**Acesse:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

---

### O que está disponível em dev vs produção

| Recurso | Dev local | Produção (EC2) |
|---------|-----------|----------------|
| CRUD de pacientes | ✅ | ✅ |
| Dietas e consultas | ✅ | ✅ |
| Geração de PDF async | ❌ (requer RabbitMQ) | ✅ |
| Upload de arquivos S3 | ❌ (requer AWS) | ✅ |
| Swagger UI | ✅ | ❌ |
| Hot reload (frontend) | ✅ | ❌ |

---

### Comandos Úteis

```bash
./manage.sh dev          # Sobe ambiente de desenvolvimento (com build)
./manage.sh stop         # Para todos os containers
./manage.sh logs backend # Vê logs do backend em tempo real
./manage.sh status       # Mostra status dos containers
```

### Problemas Comuns

**Backend não sobe / erro de conexão com MySQL:**
```bash
# Aguarde o MySQL ficar saudável (pode levar 30s na primeira vez)
./manage.sh logs mysql
```

**Erro de porta já em uso:**
```bash
# Verificar o que está usando a porta
lsof -i :8080   # ou :5173 ou :3306
```

**Rebuild completo (limpar tudo e recomeçar):**
```bash
docker compose -f docker-compose.dev.yml down -v
./manage.sh dev
```
```

- [ ] **Passo 3: Commit**

```bash
git add README.md
git commit -m "docs: adicionar guia 'One-Command-Run' no README para ambiente local"
```

---

### Tarefa 7: Verificação Final (Smoke Test)

- [ ] **Passo 1: Verificar todos os arquivos criados**

```bash
ls -la docker-compose.dev.yml .env.dev frontend/Dockerfile.dev \
        backend/src/main/resources/application-dev.properties
```

- [ ] **Passo 2: Validar sintaxe do docker-compose.dev.yml**

```bash
docker compose -f docker-compose.dev.yml --env-file .env.dev config
```

Saída esperada: configuração YAML expandida sem erros.

- [ ] **Passo 3: Executar `./manage.sh dev` e verificar que os containers sobem**

```bash
./manage.sh dev
```

Aguardar até ver nos logs:
- MySQL: `ready for connections`
- Backend: `Started` (porta 8080)
- Frontend: `VITE ready in`

- [ ] **Passo 4: Smoke test dos endpoints**

```bash
# Backend health
curl -s http://localhost:8080/actuator/health | grep '"status":"UP"'

# Swagger disponível
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/swagger-ui.html
# Esperado: 302 (redirect para swagger-ui/index.html)

# Frontend acessível
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Esperado: 200
```

- [ ] **Passo 5: Commit final de tags/versão se necessário**

```bash
git tag v0.1.0-dev-local 2>/dev/null || true
```

---

## Resultado Esperado

Após executar `./manage.sh dev`:

```
✅ MySQL:    localhost:3306  (container mysql-dev)
✅ Backend:  localhost:8080  (Spring Boot, perfil dev)
✅ Frontend: localhost:5173  (Vite dev server, hot reload ativo)
✅ Swagger:  localhost:8080/swagger-ui.html
```

O time executa:
```bash
git pull && ./manage.sh dev
```
E o projeto sobe sem erros, sem necessidade de credenciais AWS ou CloudAMQP.
