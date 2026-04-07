<!-- BANNER -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,100:16a34a&height=200&section=header&text=FittNutri&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Plataforma%20Inteligente%20para%20Nutricionistas&descAlignY=55&descSize=18" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow">
  <img src="https://img.shields.io/badge/Frontend-React-blue">
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203-red">
  <img src="https://img.shields.io/badge/Java-21-orange">
  <img src="https://img.shields.io/badge/Database-MySQL%208-green">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED">
  <img src="https://img.shields.io/badge/License-MIT-purple">
</p>

---

## Sobre o Projeto

A **FittNutri** é uma plataforma SaaS desenvolvida para otimizar a rotina de nutricionistas, centralizando ferramentas essenciais em um único ambiente intuitivo e responsivo.

O sistema permite gerenciamento completo de pacientes, consultas, dietas, relatórios e evolução nutricional.

---

## Funcionalidades

- Autenticação com JWT + Login Social com Google (OAuth 2.0)
- Cadastro completo de pacientes
- Agendamento de consultas
- Planejamento de dietas com base na Tabela TACO (5.373 alimentos)
- Alimentos customizados por nutricionista
- Dashboard com KPIs, gráfico de evolução de peso e classificações clínicas
- Geração de relatórios PDF (bioimpedância)
- Acompanhamento de evolução física
- Interface 100% responsiva

---

## Arquitetura

```
FittNutri/
 ├── backend/          Spring Boot 3 + Java 21 (REST API)
 ├── frontend/         React + Vite + Tailwind CSS
 ├── mysql/init/       Script SQL com dados da Tabela TACO
 ├── nginx/            Reverse proxy + SSL (produção)
 ├── docker-compose.dev.yml    Ambiente de desenvolvimento
 ├── docker-compose.yml        Ambiente de produção
 └── manage.sh         Script auxiliar para gerenciar containers
```

---

## Rodando Localmente com Docker (Recomendado)

### Pré-requisitos

| Requisito | Versão mínima | Download |
|-----------|---------------|----------|
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop/ |
| Git | qualquer | https://git-scm.com/ |

> **Não é necessário ter Java, Node.js ou MySQL instalados.** Tudo roda dentro do Docker.

---

### Passo 1 — Clone o repositório

```bash
git clone https://github.com/Grupo-6-ADS-B/FittNutri.git
cd FittNutri
```

---

### Passo 2 — Suba o ambiente

> **Não é necessário criar nenhum arquivo `.env`.** Todas as variáveis já têm valores padrão seguros embutidos no `docker-compose.dev.yml`.

**Opção A — Com o script `manage.sh` (recomendado):**

```bash
./manage.sh dev
```

**Opção B — Diretamente com Docker Compose:**

```bash
docker compose -f docker-compose.dev.yml up --build
```

Na primeira execução o build pode levar alguns minutos (download das imagens + build do Maven).

---

### O que sobe

| Serviço | Container | URL local | Descrição |
|---------|-----------|-----------|-----------|
| Frontend | `frontend-dev` | http://localhost:5173 | React + Vite dev server (hot reload) |
| Backend | `backend-dev` | http://localhost:8080 | Spring Boot 3, perfil `dev` |
| Swagger | — | http://localhost:8080/swagger-ui/index.html | Documentação interativa da API |
| MySQL | `mysql-dev` | localhost:3307 | Banco com dados TACO pré-carregados |

> O frontend em dev usa um **proxy** (`/api` → `backend:8080`) configurado no `vite.config.js`. Não é necessário configurar CORS manualmente.

---

### Containers no Docker Desktop

Após rodar o comando, abra o **Docker Desktop** e verifique que os 3 containers estão com status **Running**:

| Container | Status esperado |
|-----------|----------------|
| `mysql-dev` | Running |
| `backend-dev` | Running (aguarda MySQL ficar healthy) |
| `frontend-dev` | Running |

O backend demora ~30-40 segundos para iniciar na primeira vez (aguarda o MySQL + build do Spring).

---

## Dev vs Produção

| Recurso | Dev (local) | Produção (EC2) |
|---------|-------------|----------------|
| Compose file | `docker-compose.dev.yml` | `docker-compose.yml` |
| Containers | 3 (mysql, backend, frontend) | 6 (+ nginx, prometheus, grafana) |
| CRUD completo | Sim | Sim |
| Tabela TACO | Sim (5.373 alimentos) | Sim |
| Alimentos customizados | Sim | Sim |
| Swagger UI | Sim | Desabilitado |
| Hot reload frontend | Sim | Nao (build estatico) |
| Geracao de PDF async | Nao (sem RabbitMQ) | Sim |
| Upload de arquivos | Nao (sem AWS S3) | Sim |
| SSL/HTTPS | Nao | Sim (Let's Encrypt) |
| Monitoring | Nao | Sim (Prometheus + Grafana) |

> **Por que PDF e S3 nao funcionam em dev?**
> Os beans `PdfConsumerService`, `PdfProducerService`, `S3Config` e `S3Service`
> possuem a anotacao `@Profile("prod")` — eles so carregam quando `SPRING_PROFILES_ACTIVE=prod`.
> Isso e intencional: nao e necessario ter credenciais AWS para desenvolver.

---

## Comandos uteis

```bash
# Subir ambiente de dev
./manage.sh dev

# Parar todos os containers
docker compose -f docker-compose.dev.yml down

# Logs do backend em tempo real
docker logs -f backend-dev

# Logs do MySQL
docker logs -f mysql-dev

# Status dos containers, volumes e redes
./manage.sh status

# Rebuild completo (limpar banco e recomecar do zero)
docker compose -f docker-compose.dev.yml down -v
./manage.sh dev
```

---

## Visualizando logs no IntelliJ IDEA

O backend roda dentro de um container Docker, nao diretamente pela IDE.

**Opcao 1 — Terminal integrado (mais rapido):**

```bash
docker logs -f backend-dev
```

**Opcao 2 — Painel Services do IntelliJ (visual):**

1. `View → Tool Windows → Services` ou `Alt + 8`
2. Clique em `+` → **Docker** → conectar ao Docker Desktop local
3. Expanda `Docker → Containers → backend-dev`
4. Clique na aba **Log**

> O plugin Docker ja vem instalado no IntelliJ Ultimate. Na Community Edition: `File → Settings → Plugins → Marketplace → Docker`.

---

## Problemas comuns

| Problema | Solucao |
|----------|---------|
| Backend demora para subir | Normal na primeira vez (~30-40s). Acompanhe: `./manage.sh logs backend` |
| Porta ja em uso (3307) | Windows: `netstat -ano \| findstr :3307`. Possível conflito com MySQL local. |
| Porta ja em uso | Windows: `netstat -ano \| findstr :8080` / Linux: `lsof -i :8080` |
| Alimentos TACO nao aparecem na dieta | Verifique se o MySQL carregou o init: `docker exec mysql-dev mysql -uroot -proot fittnutri -e "SELECT COUNT(*) FROM alimentos WHERE fonte='TACO'"` (esperado: 5373) |
| Rebuild completo (limpar tudo) | `docker compose -f docker-compose.dev.yml down -v` e depois `./manage.sh dev` |

---

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Recharts (graficos)
- React Router DOM
- React Hook Form
- Axios

### Backend
- Java 21 + Spring Boot 3
- Spring Security + JWT
- Spring Data JPA + Hibernate
- RabbitMQ (PDF async — apenas prod)
- AWS SDK (S3 — apenas prod)
- Swagger / OpenAPI
- OpenPDF

### Banco de Dados
- MySQL 8.0
- Tabela TACO (5.373 alimentos brasileiros)

### Infraestrutura
- Docker + Docker Compose
- AWS EC2 + RDS + S3 + ALB (producao)
- Nginx (reverse proxy + SSL)
- Prometheus + Grafana (monitoring)
- Terraform (IaC)

---

## Integrantes

| | Nome | GitHub |
|---|------|--------|
| 👑 | Giovanna Mafra | [@giomafra](https://github.com/giomafra) |
| 🐱‍👤 | Kaio Kenuy | [@KaioKenuy](https://github.com/KaioKenuy) |
| 😻 | Larissa Silverio | [@silveriolaridev](https://github.com/silveriolaridev) |
| 💪 | Leandro Mandu | [@lmandu1995](https://github.com/lmandu1995) |
| 🏎 | Lucas Cartaxo | [@LucasRodriguesCartaxo](https://github.com/LucasRodriguesCartaxo) |
| 👻 | Pedro Henrique Cruz | [@PedroHCruzz](https://github.com/PedroHCruzz) |

---

## Licenca

Este projeto esta sob a licenca MIT.

---

<p align="center">
  Desenvolvido com ❤️ para transformar a nutricao digital
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:16a34a,100:22c55e&height=120&section=footer"/>
</p>
