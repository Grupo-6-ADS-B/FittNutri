# Roteiro de Apresentação — Sprint 2 FittNutri

> Gerado com base no template do professor Prates.
> De-para entre o conteúdo do projeto e os slides exigidos.

---

## Lacunas identificadas vs. template exigido

| Slide | Status | Ação necessária |
|---|---|---|
| 1 — Capa | ✅ Provavelmente existe | Verificar se tem os 6 nomes e RAs |
| 2 — Sobre o beneficiário | ⚠️ Verificar | Usar persona Alice Mafra + dados de mercado |
| 3 — Sobre o projeto | ✅ Conteúdo rico | Ajustar bullets e destacar diferencial gratuito |
| 4 — Frentes (transição) | ❓ Pode estar ausente | Criar slide de transição com 5 blocos visuais |
| 5.1 — Fila RabbitMQ | ✅ Implementado | Mostrar fluxo da geração de PDF |
| 5.2 — Clean Arch | ⚠️ Precisa de detalhe | Adicionar diagrama de camadas explicitando Clean Arch |
| 5.3 — Paginação | ✅ Implementado | Mostrar onde foi usado e como funciona |
| 6.1 — Diagrama AWS | ✅ Arquitetura completa | Usar diagrama já existente no projeto |
| 6.2 — Atividades de infra | ✅ Tem conteúdo | Listar Terraform, GitHub Actions, Docker, Grafana |
| 7.1 — OWASP | ⚠️ Crítico | Nomear os critérios explicitamente + 2 exemplos com código/tela |
| 8.1 — Frontend melhorias | ✅ Tem exemplos | Precisam de prints antes/depois |
| 9 — Gestão | ⚠️ Verificar | Mostrar prints do Trello, Gantt, status reports |
| 10 — Aprendizados | ❓ Subjetivo | Cada membro escreve o seu |
| 11.1 — Demo fila | ✅ Em produção | Roteiro: login → PDF → fila → S3 |
| 11.2 — Demo melhoria | ✅ Escolher caso | Sugestão: paginação + validação de formulário |
| 12 — Agradecimentos | ❓ Fixo | Slide padrão |
| 13 — Finalização | ❓ Fixo | Slide padrão |

---

## Slide 1 — Capa

- **Nome do projeto:** FittNutri
- **Subtítulo:** Plataforma SaaS para Nutricionistas
- **Integrantes:**
  - Giovanna Mafra Silva — RA 01242025
  - Kaio Kenuy da Silva Hergesel — RA 01242060
  - Larissa Alves Silvério — RA 01242073
  - Leandro Mandu — RA 01242034
  - Lucas R. Cartaxo — RA 01242089
  - Pedro Henrique Cruz — RA 01242069
- **Ano:** 2026 — SPTech

---

## Slide 2 — Sobre o Beneficiário

**Beneficiária:** Alice Souza Mafra
- Nutricionista há 5 anos — José Bonifácio / SP
- Atende pacientes particulares em consultório próprio

**Contexto do setor:**
- Mais de 202 mil nutricionistas ativos no Brasil (CFN, 2024)
- Crescimento de 22% em apenas 3 anos
- Setor de saúde e bem-estar movimentou US$ 35 bilhões em 2023 no Brasil

**Dores identificadas na entrevista (21/08/2025):**
- Pouco tempo entre consultas
- Sem controle centralizado de agendamentos
- Softwares caros e pouco intuitivos
- Leva trabalho para casa por falta de automação
- Gasta muito tempo em ações manuais e repetitivas

---

## Slide 3 — Sobre o Projeto

**Necessidade de negócio:**
O nutricionista hoje usa múltiplos softwares para gerenciar sua rotina clínica.
Cada ferramenta custa em média R$ 800/ano — e elas não se comunicam entre si.

**Escopo (bullets):**
- Gestão completa de pacientes com histórico clínico
- Agendamento de consultas com visualização por período
- Registro de dados antropométricos e cálculo automático de IMC e TMB
- Criação de planos alimentares com tabela TACO (5.373 alimentos)
- Geração de PDF e armazenamento em nuvem via AWS S3

**Principal diferencial:**
Plataforma gratuita, integrada e cloud-native — substitui múltiplos softwares pagos em um único ambiente seguro e escalável.

---

## Slide 4 — Frentes Trabalhadas no Semestre (transição)

Blocos visuais separando as frentes:

```
🔧 Inovação          ☁️ Infraestrutura Cloud
🖥️ Backend           🎨 Frontend
📋 Gestão e Documentação
```

---

## Slide 5.1 — Inovação: Fila com RabbitMQ

**Funcionalidade:** Geração do Plano Alimentar em PDF

**Por que fila?**
Gerar PDF é uma tarefa pesada. Sem fila, o usuário ficaria travado esperando.
Com a fila, a interface permanece responsiva enquanto o processamento ocorre em background.

**Fluxo:**
```
Nutricionista clica em "Imprimir"
        ↓
Frontend envia requisição ao Backend
        ↓
Backend publica mensagem na fila RabbitMQ (CloudAMQP)
        ↓
Worker consome a fila e gera o PDF com OpenPDF (in-memory)
        ↓
PDF salvo no Amazon S3
        ↓
URL assinada retornada ao frontend para download
```

**Tecnologias:** RabbitMQ (CloudAMQP — free tier), OpenPDF (LibrePDF), AWS S3 SDK

---

## Slide 5.2 — Inovação: Clean Architecture

**Como aplicamos ao FittNutri:**

```
[ Controller ]     → recebe requisições HTTP, delega ao Service
       ↓
[ Service ]        → lógica de negócio (cálculo de IMC, TMB, montagem do PDF)
       ↓
[ Repository ]     → interfaces JPA — isolam o acesso ao banco
       ↓
[ Model / Entity ] → entidades de domínio mapeadas com Hibernate
```

**Principais componentes:**
- Controllers: `PatientController`, `SchedulingController`, `AnthropometricDataController`
- Services: `PatientService`, `PdfService`, `AuthService`
- Repositories: `PatientRepository`, `SchedulingRepository`

**Benefício prático:**
Mudamos o banco de H2 (dev) para MySQL (prod) sem alterar nenhuma regra de negócio —
só a configuração de conexão. Isso é Clean Architecture na prática.

---

## Slide 5.3 — Inovação: Paginação

**Onde foi implementada:**
- Tela de Gerenciamento de Pacientes
- Tela de Consultas Agendadas
- Dashboard de Evolução Clínica

**Como foi feita:**
- Backend: `Pageable` do Spring Data JPA — dados retornados em páginas configuráveis
- Frontend: componente de paginação em React consumindo o endpoint paginado
- Parâmetros: `page`, `size`, `sort` passados via query string

**Por que importa:**
Com dezenas de pacientes cadastrados, carregar tudo de uma vez sobrecarregaria o banco.
A paginação garante performance mesmo com crescimento do volume de dados.

---

## Slide 6.1 — Infraestrutura: Diagrama da Solução

> Usar o diagrama AWS já existente na documentação do projeto.

**Questões de robustez e segurança endereçadas:**
- VPC segmentada — EC2 nunca expostas diretamente à internet
- ALB como único ponto de entrada com HTTPS (certificado ACM)
- Sem SSH/bastion — acesso via AWS SSM Session Manager
- EBS criptografado com `prevent_destroy = true`
- Segredos via AWS Secrets Manager — zero credenciais em código

---

## Slide 6.2 — Infraestrutura: Atividades Envolvidas

| Atividade | Detalhe |
|---|---|
| Provisionamento AWS | Toda infra criada via Terraform — VPC, subnets, ALB, EC2, S3, ACM |
| Deploy da aplicação | Docker Compose na EC2 — Nginx + Backend + Frontend em containers |
| CI/CD automatizado | GitHub Actions — 3 jobs: `backend-ci`, `frontend-ci`, `deploy` |
| Monitoramento | Prometheus + Grafana provisionados automaticamente via Terraform |
| SSL/HTTPS | Certificado gerenciado pelo AWS ACM integrado ao ALB |
| DNS | Namecheap com CNAME apontando para o ALB |

**O que está automatizado:**
- Push na `main` → build → testes → deploy automático
- Grafana sobe com dashboard FittNutri já configurado
- Renovação de certificado gerenciada pela AWS (sem intervenção manual)

---

## Slide 7.1 — Backend: OWASP Top 10

**Critérios selecionados:**

### A02 — Cryptographic Failures (Falhas Criptográficas)
> Risco: dados sensíveis expostos ou mal protegidos

**Aplicação no FittNutri:**
- CPF dos pacientes armazenado criptografado com AES no banco de dados
- Senhas armazenadas com hash bcrypt via Spring Security
- Comunicação 100% via HTTPS (ACM + ALB)

---

### A07 — Identification and Authentication Failures (Falhas de Autenticação)
> Risco: sessões mal gerenciadas, tokens fracos ou sem expiração

**Aplicação no FittNutri:**
- Autenticação stateless com JWT assinado com chave via AWS Secrets Manager
- Token com tempo de expiração configurável
- Spring Security valida o token em cada requisição — sem estado de sessão
- Axios injeta automaticamente o Bearer Token em todas as chamadas protegidas

---

## Slide 8.1 — Frontend: Melhorias de Interface

**Pontos trabalhados ao longo do projeto:**
- Mensagens de erro em todos os formulários (validação em tempo real)
- Paginação nas listagens (pacientes, consultas, dashboard)
- Feedback visual de carregamento (loading states)
- Responsividade com Tailwind CSS + MUI
- Formulários com React Hook Form (zero re-renders desnecessários)
- Dashboard de evolução com gráfico de peso por consulta

---

**Exemplo 1 — Mensagens de erro nos formulários**

| Antes | Depois |
|---|---|
| Formulário enviava sem validação — erro genérico do servidor | Cada campo exibe mensagem específica em tempo real: "CPF inválido", "Campo obrigatório", "E-mail já cadastrado" |
| *(print da tela antiga)* | *(print da tela atual com as mensagens)* |

---

**Exemplo 2 — Paginação na listagem de pacientes**

| Antes | Depois |
|---|---|
| Todos os pacientes carregados de uma vez — lento e sem controle | Paginação com 10 pacientes por página, navegação por setas, total exibido |
| *(print sem paginação)* | *(print com componente de paginação)* |

---

## Slide 9 — Documentação e Gestão do Projeto

**Acompanhamento das aulas:**
- Presença e participação nas aulas de atendimento com o professor Prates
- Alinhamentos com ajustes de escopo e prioridade a cada sprint

**Status Reports semanais:**
- Relatórios documentando: o que foi feito, o que está em andamento, bloqueios
- Evidências registradas no projeto de extensão

**Ferramentas e organização:**
- Trello — Kanban com 3 Sprints, tarefas por membro e status
- Gráfico de Gantt — linha do tempo com marcos e dependências
- Figma — protótipos validados com a cliente antes do desenvolvimento
- GitHub — branches separadas: `main` (produção), `dev` (integração)

**Divisão de tarefas:**

| Membro | Frente principal |
|---|---|
| Giovanna Mafra | Backend — CRUDs, JWT, Spring Security |
| Pedro Cruz | Frontend — telas React, integração com API |
| Larissa Alves | Frontend — componentes, prototipação Figma |
| Kaio Kenuy | Documentação, arquitetura, testes |
| Lucas Cartaxo | Infraestrutura AWS, Terraform, CI/CD |
| Leandro Mandu | Documentação, padrões de projeto |

---

## Slide 10 — Principais Aprendizados

> Cada membro deve descrever o seu aprendizado pessoal.

**Aprendizados técnicos do time:**
- Implementar infraestrutura cloud real com Terraform do zero
- Trabalhar com mensageria assíncrona (RabbitMQ) em um caso real
- Aplicar Clean Architecture numa aplicação Spring Boot de médio porte
- Configurar CI/CD com GitHub Actions conectado a uma EC2 em produção

**Desafios enfrentados:**
- Sincronizar frontend e backend com equipe distribuída
- Gerenciar segredos e credenciais com segurança em ambiente AWS
- Adaptar o escopo às demandas reais da beneficiária ao longo das sprints
- Fazer a infraestrutura funcionar dentro das restrições do AWS Academy

---

## Slide 11 — Demonstração em Produção (transição)

- **Título:** Sistema ao vivo — FittNutri em Produção
- **URL:** *(endereço de produção da equipe)*

---

## Slide 11.1 — Demo: Fila funcionando

**Roteiro:**
1. Fazer login no sistema em produção
2. Acessar um paciente cadastrado
3. Abrir o Plano Alimentar com refeições já montadas
4. Clicar em "Imprimir"
5. Mostrar no Grafana/logs a mensagem sendo publicada na fila RabbitMQ
6. PDF gerado e disponível para download — armazenado no S3

---

## Slide 11.2 — Demo: Melhoria de Backend / Frontend

**Roteiro sugerido:**
1. Acessar a tela de Gerenciamento de Pacientes
2. Mostrar a paginação funcionando com navegação entre páginas
3. Tentar cadastrar um paciente com CPF inválido → mostrar mensagem de erro em tempo real
4. Completar o cadastro corretamente → paciente aparece na lista paginada

---

## Slide 12 — Agradecimentos (fixo)

- Ao professor Prates pelo acompanhamento e feedback ao longo do semestre
- À nossa beneficiária Alice pela disponibilidade e paciência nas entrevistas
- À SPTech pela estrutura e pelo projeto de extensão
- A toda a equipe pelo comprometimento

---

## Slide 13 — Finalização (fixo)

- **Nome:** FittNutri
- **Subtítulo:** Transformando a nutrição com tecnologia
- **GitHub:** `github.com/Grupo-6-ADS-B/FittNutri`
- **Sistema em produção:** *(URL da equipe)*

---

## Checklist antes de montar no Canva

- [ ] Capturar prints antes/depois do frontend (slide 8.1)
- [ ] Capturar prints do Trello e Gantt (slide 9)
- [ ] Confirmar a URL de produção (slides 11, 13)
- [ ] Cada membro escrever seu aprendizado pessoal (slide 10)
- [ ] Verificar se o slide de transição (slide 4) existe no Canva atual
- [ ] Verificar se os nomes e RAs estão corretos na capa (slide 1)
