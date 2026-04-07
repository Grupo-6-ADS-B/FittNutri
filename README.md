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

## Rodando Localmente com Docker

> Voce **nao precisa instalar Java, Node.js ou MySQL** na sua maquina. O Docker cuida de tudo isso.

---

### Pre-requisitos

Voce precisa ter dois programas instalados:

#### 1. Docker Desktop
O Docker Desktop e o programa que vai criar e rodar os containers da aplicacao (banco de dados, backend e frontend).

1. Acesse: https://www.docker.com/products/docker-desktop/
2. Baixe a versao para o seu sistema operacional (Windows, Mac ou Linux)
3. Instale normalmente (next, next, finish)
4. **Abra o Docker Desktop** e aguarde ele iniciar — o icone na bandeja do sistema (canto inferior direito no Windows) ficara estatico quando estiver pronto

> Se aparecer uma tela pedindo para criar conta, pode fechar ou criar uma conta gratuita. Nao e obrigatorio.

#### 2. Git
O Git e usado para baixar o codigo do projeto.

1. Acesse: https://git-scm.com/
2. Baixe e instale com as opcoes padrao
3. No Windows, apos instalar, use sempre o **Git Bash** (nao o CMD nem o PowerShell) para rodar os comandos deste guia

> **Como abrir o Git Bash no Windows:** clique com o botao direito dentro de qualquer pasta e selecione "Git Bash Here", ou pesquise "Git Bash" no menu iniciar.

---

### Passo 1 — Baixe o projeto

Abra o **Git Bash** e execute os comandos abaixo um por vez:

```bash
git clone https://github.com/Grupo-6-ADS-B/FittNutri.git
```
```bash
cd FittNutri
```
```bash
git checkout dev
```

Apos isso, voce tera uma pasta `FittNutri` com todo o codigo do projeto.

---

### Passo 2 — Verifique se o Docker Desktop esta rodando

Antes de subir o projeto, confirme que o Docker Desktop esta aberto e com o icone **verde ou estatico** na bandeja do sistema.

Se estiver fechado, abra e aguarde aparecer a mensagem **"Docker Desktop is running"**.

---

### Passo 3 — Suba o ambiente

> Nao precisa criar nenhum arquivo de configuracao. Todos os valores ja estao definidos com padroes para desenvolvimento local.

Dentro da pasta `FittNutri` no Git Bash, execute:

```bash
./manage.sh dev
```

**Na primeira vez, esse processo pode levar entre 5 e 10 minutos** — o Docker vai baixar as imagens necessarias e compilar o projeto. Isso e normal, pode aguardar.

Voce vai ver varias linhas aparecendo no terminal. Quando terminar, ele para de rolar e aparece algo como:

```
Container backend-dev  Started
Container frontend-dev  Started
```

---

### Passo 4 — Confirme que tudo subiu

Abra o **Docker Desktop**, clique em **Containers** no menu lateral esquerdo e verifique se os 3 containers estao com o icone **verde** (Running):

| Container | O que e | Status esperado |
|-----------|---------|----------------|
| `mysql-dev` | Banco de dados | Running |
| `backend-dev` | API do sistema | Running |
| `frontend-dev` | Tela do sistema | Running |

> O `backend-dev` pode demorar **ate 40 segundos** para ficar verde apos o MySQL subir. Se ainda estiver amarelo/laranja, aguarde um pouco antes de abrir o navegador.

---

### Passo 5 — Acesse a aplicacao

Abra o navegador e acesse:

**http://localhost:5173**

| O que e | URL |
|---------|-----|
| Aplicacao (tela do sistema) | http://localhost:5173 |
| API do backend | http://localhost:8080 |
| Documentacao da API (Swagger) | http://localhost:8080/swagger-ui/index.html |

---

### Como parar o projeto

Quando quiser parar, volte ao terminal e aperte `Ctrl + C`, ou execute:

```bash
docker compose -f docker-compose.dev.yml down
```

Para subir novamente depois (sem precisar rebuildar tudo):

```bash
./manage.sh dev
```

---

## Dev vs Producao

| Recurso | Dev (local) | Producao (EC2) |
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
> Os beans `PdfConsumerService`, `PdfProducerService`, `S3Config` e `S3Service` possuem a anotacao `@Profile("prod")` — eles so carregam quando `SPRING_PROFILES_ACTIVE=prod`. Isso e intencional: nao e necessario ter credenciais AWS para desenvolver.

---

## Comandos uteis

```bash
# Subir ambiente de dev
./manage.sh dev

# Parar todos os containers
docker compose -f docker-compose.dev.yml down

# Ver logs do backend em tempo real (util para ver erros)
docker logs -f backend-dev

# Ver logs do frontend em tempo real
docker logs -f frontend-dev

# Ver logs do banco de dados
docker logs -f mysql-dev

# Status dos containers, volumes e redes
./manage.sh status

# Rebuild completo — use quando mudar codigo e o projeto nao atualizar
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache
./manage.sh dev

# Reset total — apaga o banco e recria tudo do zero
docker compose -f docker-compose.dev.yml down -v
./manage.sh dev
```

---

## Problemas comuns

### O projeto nao abre no navegador
- Verifique se os 3 containers estao **Running** no Docker Desktop
- Aguarde o `backend-dev` ficar verde (pode levar ate 40 segundos)
- Tente acessar em aba anonima (`Ctrl + Shift + N`)

### Erro "porta ja em uso"

**Porta 8080 ocupada** — algum processo Java esta rodando. Para descobrir qual e encerrar:
```bash
# Windows (Git Bash)
netstat -ano | grep :8080
# Anote o PID (ultimo numero) e execute:
taskkill //PID <numero_do_pid> //F
```

**Porta 3306 ocupada** — MySQL instalado localmente no Windows esta ativo. Para parar:
```bash
net stop MySQL80
```

### O frontend atualizou mas o navegador nao mudou
Aperte `Ctrl + Shift + R` para forcar recarregar sem cache.

### Mudei codigo mas nao refletiu no projeto
O container foi buildado com os arquivos antigos. Faca o rebuild:
```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache frontend
./manage.sh dev
```

### Os alimentos TACO nao aparecem na dieta
Verifique se o banco carregou corretamente:
```bash
docker exec mysql-dev mysql -uroot -proot fittnutri -e "SELECT COUNT(*) FROM alimentos WHERE fonte='TACO'"
```
O resultado esperado e `5373`. Se for `0`, pare tudo com `down -v` e suba novamente para recriar o banco.

### `./manage.sh dev` retorna "Permission denied"
```bash
chmod +x manage.sh
./manage.sh dev
```

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
