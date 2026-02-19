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
