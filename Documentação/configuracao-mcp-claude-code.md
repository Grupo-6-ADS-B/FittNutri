# Configuração dos MCPs no Claude Code — FittNutri

> Contexto: MCPs (Model Context Protocol) são extensões que permitem ao Claude Code
> interagir diretamente com ferramentas externas — AWS, GitHub, Docker, MySQL e Postman —
> sem precisar copiar e colar contexto manualmente.
> As credenciais AWS são temporárias (AWS Academy, expiram a cada ~4h) e precisam de
> reconexão automática antes de cada operação Terraform.

---

## Índice

1. [MCPs configurados](#1-mcps-configurados)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Configurar MCP do Postman](#3-configurar-mcp-do-postman)
4. [Configurar MCP do GitHub](#4-configurar-mcp-do-github)
5. [Configurar MCP do Docker](#5-configurar-mcp-do-docker)
6. [Configurar MCP da AWS](#6-configurar-mcp-da-aws)
7. [Configurar MCP do MySQL](#7-configurar-mcp-do-mysql)
8. [Hook de reconexão automática antes do Terraform](#8-hook-de-reconexão-automática-antes-do-terraform)
9. [Verificar status dos MCPs](#9-verificar-status-dos-mcps)
10. [Armadilhas conhecidas](#10-armadilhas-conhecidas)

---

## 1. MCPs configurados

| MCP      | Escopo  | Quando conecta                          |
|----------|---------|-----------------------------------------|
| `postman`| Local   | Sempre                                  |
| `github` | Global  | Sempre                                  |
| `docker` | Global  | Quando o Docker Desktop estiver rodando |
| `aws`    | Global  | Quando o lab AWS Academy estiver ativo  |
| `mysql`  | Global  | Quando `docker compose up` estiver ativo|

---

## 2. Pré-requisitos

- Claude Code instalado
- Node.js >= 18 e `npx` disponível no PATH
- `uv`/`uvx` instalado em `~/.local/bin/uvx` (para o MCP da AWS)
- AWS CLI configurado (`~/.aws/credentials`)
- Docker Desktop instalado e rodando (para o MCP do Docker e MySQL)

### Instalar uv (se necessário)

```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

Após instalar, `uvx` fica disponível em `C:\Users\<seu-usuario>\.local\bin\uvx`.

---

## 3. Configurar MCP do Postman

O pacote correto é `@postman/postman-mcp-server` (não `@postman/mcp-server` — esse não existe no npm).

```bash
claude mcp add postman --transport stdio -s local \
  -e "POSTMAN_API_KEY=<sua-api-key>" \
  -- npx -y @postman/postman-mcp-server
```

### Obter a API Key do Postman

1. Acesse **postman.com → Account Settings → API Keys**
2. Clique em **Generate API Key**
3. Copie o valor gerado (começa com `PMAK-`)

> **Escopo local:** a API key fica em `~/.claude.json` e não é commitada.

---

## 4. Configurar MCP do GitHub

```bash
claude mcp add github --transport stdio -s user \
  -e "GITHUB_PERSONAL_ACCESS_TOKEN=<seu-token>" \
  -- npx -y @modelcontextprotocol/server-github
```

### Criar o Personal Access Token

1. Acesse **github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Clique em **Generate new token**
3. Permissões necessárias: `Contents`, `Pull requests`, `Issues`, `Actions` (read/write)
4. Copie o token gerado (começa com `github_pat_`)

> **Escopo user:** disponível em todos os projetos do Claude Code na sua máquina.

---

## 5. Configurar MCP do Docker

Não requer credenciais — conecta diretamente ao socket do Docker.

```bash
claude mcp add docker --transport stdio -s user \
  -- npx -y mcp-server-docker
```

> Requer que o **Docker Desktop esteja rodando** no momento da conexão.

---

## 6. Configurar MCP da AWS

As credenciais do AWS Academy expiram a cada ~4h. Use **PowerShell** para configurar
(o Git Bash converte o `/` da secret key em caminho Windows, corrompendo a credencial).

```powershell
$access = aws configure get aws_access_key_id
$secret = aws configure get aws_secret_access_key
$token  = aws configure get aws_session_token

claude mcp add aws --transport stdio -s user `
  -e "AWS_ACCESS_KEY_ID=$access" `
  -e "AWS_SECRET_ACCESS_KEY=$secret" `
  -e "AWS_SESSION_TOKEN=$token" `
  -e "AWS_REGION=us-east-1" `
  -- "C:/Users/<seu-usuario>/.local/bin/uvx" awslabs.core-mcp-server
```

### Reconfigurar após expiração das credenciais

1. Atualize `~/.aws/credentials` com as novas credenciais do lab (ver runbook de deploy)
2. Execute o bloco PowerShell acima novamente

> O [hook de reconexão automática](#8-hook-de-reconexão-automática-antes-do-terraform)
> faz isso automaticamente antes de qualquer `terraform *` para que você não precise lembrar.

---

## 7. Configurar MCP do MySQL

O MySQL local roda via Docker Compose na porta `3307` (mapeada da `3306` interna do container).

```bash
claude mcp add mysql --transport stdio -s user \
  -e "MYSQL_HOST=localhost" \
  -e "MYSQL_PORT=3307" \
  -e "MYSQL_USER=root" \
  -e "MYSQL_PASS=root" \
  -e "MYSQL_DB=fittnutri" \
  -- npx -y @berthojoris/mcp-mysql-server
```

> Só conecta quando `docker compose up` estiver rodando no projeto local.
> Para o banco de produção (RDS), substitua `MYSQL_HOST` pelo endpoint do RDS
> e as credenciais pelos valores do `lab.tfvars`.

---

## 8. Hook de reconexão automática antes do Terraform

O hook abaixo executa automaticamente antes de qualquer comando `terraform *`,
atualizando as credenciais da AWS no MCP com os valores atuais do `aws configure`.
Assim, mesmo que o lab tenha expirado e você tenha renovado as credenciais, o MCP
estará sempre sincronizado sem precisar reconfigurar manualmente.

### Script de atualização

Localização: `C:\Users\<seu-usuario>\.claude\scripts\refresh-aws-mcp.ps1`

```powershell
$access = aws configure get aws_access_key_id 2>$null
$secret = aws configure get aws_secret_access_key 2>$null
$token  = aws configure get aws_session_token 2>$null

if (-not $access -or -not $secret) {
    @{ systemMessage = "AWS MCP: credenciais nao encontradas em 'aws configure'. Configure as credenciais do lab antes de rodar Terraform." } | ConvertTo-Json -Compress
    exit 0
}

claude mcp remove "aws" -s user 2>$null | Out-Null
claude mcp add aws --transport stdio -s user `
    -e "AWS_ACCESS_KEY_ID=$access" `
    -e "AWS_SECRET_ACCESS_KEY=$secret" `
    -e "AWS_SESSION_TOKEN=$token" `
    -e "AWS_REGION=us-east-1" `
    -- "C:/Users/Ivand/.local/bin/uvx" awslabs.core-mcp-server 2>$null | Out-Null

@{ systemMessage = "AWS MCP atualizado com credenciais do lab (key: $($access.Substring(0,8))...)" } | ConvertTo-Json -Compress
```

### Hook configurado em `.claude/settings.local.json`

O hook fica no arquivo `terraform/.claude/settings.local.json` (está no `.gitignore` — não é commitado):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(terraform *)",
            "shell": "powershell",
            "command": "powershell -File \"C:/Users/Ivand/.claude/scripts/refresh-aws-mcp.ps1\"",
            "timeout": 30,
            "statusMessage": "Atualizando credenciais AWS no MCP..."
          }
        ]
      }
    ]
  }
}
```

> **Como funciona:** ao rodar qualquer `terraform plan`, `terraform apply` ou
> `terraform destroy`, o Claude Code executa o script antes de enviar o comando.
> O script lê as credenciais do `aws configure` (sempre com PowerShell, sem o bug
> de conversão de path do Git Bash) e reconfigura o MCP com os valores atuais.

---

## 9. Verificar status dos MCPs

```bash
claude mcp list
```

**Saída esperada com o lab ativo e Docker rodando:**

```
docker:  npx -y mcp-server-docker               - ✓ Connected
github:  npx -y @modelcontextprotocol/server-github - ✓ Connected
aws:     C:/Users/.../uvx awslabs.core-mcp-server   - ✓ Connected
mysql:   npx -y @berthojoris/mcp-mysql-server        - ✓ Connected
postman: npx -y @postman/postman-mcp-server          - ✓ Connected
```

Para inspecionar a configuração de um MCP específico:

```bash
claude mcp get aws
```

---

## 10. Armadilhas conhecidas

### AWS secret key corrompida pelo Git Bash

**Sintoma:** `claude mcp get aws` mostra `AWS_SECRET_ACCESS_KEY=C:/Program Files/Git/...`
**Causa:** O Git Bash converte strings que começam com `/` em caminhos Windows.
A secret key da AWS contém `/` e é interpretada como path.
**Solução:** Sempre use PowerShell (não bash) para configurar o MCP da AWS:

```powershell
$secret = aws configure get aws_secret_access_key
```

### MCP da AWS falha com `✗ Failed to connect`

**Causa mais comum:** O lab AWS Academy não está ativo — as credenciais expiraram.
**Solução:**
1. Ligue o lab no AWS Academy
2. Atualize `~/.aws/credentials` com as novas credenciais
3. Rode o bloco PowerShell da seção 6 para reconfigurar

### Pacote npm errado do Postman

**Sintoma:** `npm error 404 Not Found - GET https://registry.npmjs.org/@postman%2fmcp-server`
**Causa:** O pacote `@postman/mcp-server` não existe. O correto é `@postman/postman-mcp-server`.
**Solução:** Remova e reconfigure com o nome certo:

```bash
claude mcp remove "postman" -s local
claude mcp add postman --transport stdio -s local \
  -e "POSTMAN_API_KEY=<sua-key>" \
  -- npx -y @postman/postman-mcp-server
```

### MySQL com `✗ Failed to connect`

**Causa:** O container `mysql-dev` não está rodando.
**Solução:** Suba o ambiente local:

```bash
docker compose up -d mysql
```

### Hook não dispara na primeira sessão

**Causa:** O Claude Code só detecta novos arquivos de settings em `./claude/`
se eles já existiam quando a sessão foi iniciada.
**Solução:** Abra o menu `/hooks` uma vez ou reinicie o Claude Code para recarregar a configuração.
