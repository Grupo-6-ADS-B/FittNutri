---

## Rodando Localmente (One-Command-Run)

### Pré-requisitos

| Requisito | Versão mínima | Download |
|-----------|---------------|---------|
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop/ |
| Git | qualquer | https://git-scm.com/ |

> Não é necessário ter Java, Node.js ou MySQL instalados na máquina. Tudo roda dentro do Docker.

---

### Passo 1 — Clone o repositório

```bash
git clone <url-do-repositório>
cd FittNutri
```

---

### Passo 2 — Crie o arquivo `.env.dev`

O script `manage.sh dev` exige um arquivo `.env.dev` na raiz do projeto.
Copie o exemplo já fornecido:

```bash
# Linux / macOS / Git Bash (Windows)
cp .env.dev.example .env.dev
```

> Os valores padrão do `.env.dev.example` funcionam para desenvolvimento local sem nenhuma alteração.

---

### Passo 3 — Suba o ambiente

```bash
./manage.sh dev
```

O script vai buildar as imagens e subir os 3 containers automaticamente.
Na primeira execução o build pode levar alguns minutos.

---

### O que sobe

| Serviço | URL local | Descrição |
|---------|-----------|-----------|
| Frontend | http://localhost:5173 | React + Vite dev server (hot reload) |
| Backend | http://localhost:8080 | Spring Boot, perfil `dev` |
| Swagger | http://localhost:8080/swagger-ui/index.html | Documentação da API |
| MySQL | localhost:3306 | Banco de dados (acessível via cliente) |

---

### Dev vs Produção

| Recurso | Dev local | Produção (EC2) |
|---------|-----------|----------------|
| CRUD completo | ✅ | ✅ |
| Swagger UI | ✅ | ❌ |
| Hot reload frontend | ✅ | ❌ |
| Geração de PDF async | ❌ (sem RabbitMQ) | ✅ |
| Upload de arquivos | ❌ (sem AWS S3) | ✅ |

> **Por que PDF e S3 não funcionam em dev?**
> Os beans `PdfConsumerService`, `PdfProducerService`, `S3Config` e `S3Service`
> têm a anotação `@Profile("prod")` — eles só carregam em produção.
> Isso é intencional: não é necessário ter credenciais AWS para desenvolver.

---

### Visualizando logs do backend no IntelliJ IDEA

O backend roda dentro de um container Docker, não diretamente pela IDE.
Para acompanhar os logs em tempo real no IntelliJ:

**Opção 1 — Terminal integrado (mais rápido)**

Abra o terminal integrado do IntelliJ (`Alt + F12`) e execute:

```bash
docker logs -f backend-dev
```

**Opção 2 — Painel Services do IntelliJ (visual)**

1. Abra o painel Services: `View → Tool Windows → Services` ou `Alt + 8`
2. Clique em `+` → **Docker** → **Docker** para conectar ao Docker Desktop local
3. Expanda `Docker → Containers → backend-dev`
4. Clique na aba **Log** no painel lateral direito
5. Os logs aparecem em tempo real, com suporte a filtro e busca

> O plugin Docker já vem instalado no IntelliJ IDEA Ultimate. Na Community Edition, instale via `File → Settings → Plugins → Marketplace → Docker`.

---

### Comandos úteis

```bash
./manage.sh dev          # Sobe ambiente de dev (com build)
./manage.sh stop         # Para todos os containers
./manage.sh logs backend # Logs do backend em tempo real
./manage.sh logs mysql   # Logs do MySQL
./manage.sh status       # Status dos containers, volumes e redes
```

---

### Problemas comuns

**Backend demora para subir na primeira vez:**
```bash
# O MySQL leva ~30s para inicializar. Aguarde e acompanhe:
./manage.sh logs mysql
```

**Arquivo `.env.dev` não encontrado:**
```bash
cp .env.dev.example .env.dev
```

**Erro de porta já em uso:**
```bash
# Linux / macOS
lsof -i :8080   # ou :5173 ou :3306

# Windows (PowerShell)
netstat -ano | findstr :8080
```

**Rebuild completo (limpar banco e recomeçar do zero):**
```bash
docker compose -f docker-compose.dev.yml down -v
./manage.sh dev
```

---

<!-- BANNER -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,100:16a34a&height=200&section=header&text=FittNutri&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Plataforma%20Inteligente%20para%20Nutricionistas&descAlignY=55&descSize=18" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow">
  <img src="https://img.shields.io/badge/Frontend-React-blue">
  <img src="https://img.shields.io/badge/Backend-SpringBoot-red">
  <img src="https://img.shields.io/badge/Database-MySQL-green">
  <img src="https://img.shields.io/badge/License-MIT-purple">
  <img src="https://img.shields.io/github/stars/Grupo-6-ADS-B/Jane-Nutri?style=social">
</p>

---

# 🥗 Sobre o Projeto

A **FittNutri** é uma plataforma digital moderna desenvolvida para otimizar a rotina de nutricionistas, centralizando ferramentas essenciais em um único ambiente intuitivo e responsivo.

O sistema permite gerenciamento completo de pacientes, consultas, relatórios e evolução nutricional, trazendo tecnologia acessível para a prática clínica.

---

# 🎯 Objetivo

Democratizar o acesso à tecnologia para profissionais da nutrição, reduzindo custos operacionais e aumentando produtividade.

---

# ✨ Funcionalidades

- 🔐 Autenticação com JWT
- 🔑 Login Social com Google 
- 👤 Cadastro completo de pacientes
- 📅 Agendamento de consultas
- 📊 Dashboard com métricas nutricionais
- 📄 Geração de relatórios em PDF
- 📈 Acompanhamento de evolução física
- 📱 Interface 100% responsiva

---

# 🏗 Arquitetura do Projeto

```
📦 Jane-Nutri
 ┣ 📂 backend (Spring Boot)
 ┃ ┣ 📂 controllers
 ┃ ┣ 📂 services
 ┃ ┣ 📂 repositories
 ┃ ┣ 📂 models
 ┃ ┗ pom.xml
 ┣ 📂 frontend (React + Vite)
 ┃ ┣ 📂 components
 ┃ ┣ 📂 pages
 ┃ ┣ 📂 services
 ┃ ┗ package.json
```

---

# 🛠 Tecnologias Utilizadas

## 🎨 Frontend
- React
- Vite
- Tailwind CSS
- Material UI
- React Router DOM
- React Hook Form
- Axios

---

## 🔙 Backend
- Java 17
- Spring Boot
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - Validation
  - Actuator
- JWT
- Swagger / OpenAPI
- OpenPDF
- H2 (dev/test)
- JUnit & Mockito

---

## 🗄 Banco de Dados
- MySQL

---

## ☁️ Infraestrutura
- Docker
- AWS
- Git & GitHub

---

# 🚀 Como Rodar o Projeto (Local)

## 📋 Pré-requisitos

- Node.js 18+
- npm 9+
- Java 17+
- MySQL
- Git

---

## 🔄 1. Clone o Repositório

```bash
git clone https://github.com/Grupo-6-ADS-B/Jane-Nutri.git
cd Jane-Nutri
```

---

## 📦 2. Rodar Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse:

```
http://localhost:5173
```

---

## ☕ 3. Rodar Backend

Abra a pasta backend na sua IDE (IntelliJ recomendado).

Execute a aplicação Spring Boot.

Backend disponível em:

```
http://localhost:8080
```

Swagger:

```
http://localhost:8080/swagger-ui.html
```

---

# 🐳 Deploy com Docker

### Build Backend

```bash
docker build -t fittnutri-backend ./backend
```

### Build Frontend

```bash
docker build -t fittnutri-frontend ./frontend
```

### Subir Containers

```bash
docker-compose up --build
```

---

# 🌍 Estrutura Recomendada para Produção

✔ Backend → AWS EC2 ou Elastic Beanstalk  
✔ Frontend → Vercel ou AWS S3 + CloudFront  
✔ Banco → AWS RDS MySQL  
✔ Arquivos e imagens → AWS S3  

---

# 🔐 Autenticação

- Login tradicional com JWT
- Login social Google (OAuth 2.0)
- Segurança com Spring Security
- Tokens com expiração configurável
---

# 🗺 Roadmap

- [x] CRUD Pacientes
- [x] Autenticação JWT
- [x] Geração de PDF
- [ ] Login com Google
- [ ] Deploy em produção
- [ ] Sistema de notificações

---

## 👥Integrantes
👑 <a href="https://github.com/giomafra">Giovanna Mafra</a><br>
🐱‍👤 <a href="https://github.com/KaioKenuy">Kaio Kenuy</a><br>
😻 <a href="https://github.com/silveriolaridev">Larissa Silvério</a><br>
💪 <a href="https://github.com/lmandu1995">Leandro Mandu</a><br>
🏎 <a href="https://github.com/LucasRodriguesCartaxo">Lucas Cartaxo</a><br>
👻 <a href="https://github.com/PedroHCruzz">Pedro Henrique Cruz</a><br>
---

# 📜 Licença

Este projeto está sob a licença MIT.

---

<p align="center">
  Desenvolvido com ❤️ para transformar a nutrição digital
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:16a34a,100:22c55e&height=120&section=footer"/>
</p>
