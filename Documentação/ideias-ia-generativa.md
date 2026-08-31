# Ideias de IA Generativa — FittNutri

**Data da análise:** 2026-08-03
**Branch analisada:** `claude-test`
**Status:** rascunho para discussão — nenhuma ideia aqui foi aprovada ou planejada em detalhe
**Responsável pelo levantamento:** Claude Code (análise estática do código + brainstorming)

---

## Sumário

| # | Ideia | Dor atacada | Custo estimado | Complexidade |
|---|---|---|---|---|
| 1 | Geração assistida de plano alimentar | Ações manuais, pouco tempo entre consultas | Alto | Alta |
| 2 | Resumo de evolução clínica em linguagem natural | Paciente não entende bem sua evolução | Baixo | Baixa |
| 3 | Geração de variações de receitas para e-book | Monetização de receitas | Médio | Média |
| 4 | Estruturação automática de anamnese | Trabalho levado para casa | Médio | Média-alta |
| 5 | Assistente de substituição de alimentos | Ações manuais no dia a dia | Baixo | Baixa |

---

## Situação atual

Auditoria do repositório confirmou que **não há nenhuma integração de IA generativa** no produto hoje. O que existe e pode gerar confusão à primeira vista:

| Item | O que é de fato |
|---|---|
| `google-api-client` / `@react-oauth/google` | Login OAuth do Google — não é IA |
| `resend.api-key` | API do Resend (e-mail transacional) — não é IA |
| `springdoc-openapi` | Swagger/OpenAPI (documentação de API REST) — não confundir com "OpenAI" |

IA generativa aparece apenas nas ferramentas de desenvolvimento (pasta `.claude/` do repositório, skills do Claude Code) — é tooling de desenvolvimento, não faz parte do produto entregue ao usuário final.

---

## Dores da persona (base para priorização)

Da persona **Alice Souza Mafra** (47 anos, nutricionista, 5 anos de atuação), documentada na seção de artefatos de regra de negócio do projeto:

- Pouco tempo entre consultas
- Gasta muito tempo fazendo ações manuais
- Leva muito trabalho para casa
- Ferramentas e softwares nada intuitivos
- Gostaria de vender suas receitas por e-book
- Gostaria de melhorar a forma como os pacientes veem sua evolução

---

## Detalhamento das ideias

---

### 1. Geração assistida de plano alimentar

**Dor atacada:** ações manuais, pouco tempo entre consultas.

Botão "Sugerir plano com IA" na tela de Plano Alimentar. Dado o perfil do paciente (objetivo, restrições, macros-alvo já calculados via TMB/IMC), a IA gera um rascunho de cardápio usando a base TACO (5.373 alimentos) já cadastrada no sistema. A nutricionista sempre revisa e ajusta antes de salvar — a IA nunca publica direto.

- **Módulos afetados:** `MealController`, `MealService`, tabela `alimentos`
- **Custo estimado:** alto (várias refeições, contexto grande por chamada)
- **Complexidade:** alta — precisa de prompt engineering para respeitar macros e restrições, além de validação server-side do resultado

---

### 2. Resumo de evolução clínica em linguagem natural

**Dor atacada:** paciente não entende bem sua evolução.

O dashboard já tem os dados históricos (peso, IMC, gordura visceral, TMB por consulta). A IA gera um parágrafo curto (ex.: "Desde a última consulta, o paciente reduziu 2kg e a gordura visceral está estável...") incluído no PDF exportado para o paciente.

- **Módulos afetados:** `AnthropometricDataController`, pipeline de PDF (`PdfProducerService` / `PdfConsumerService`)
- **Custo estimado:** baixo — 1 chamada curta por consulta/PDF
- **Complexidade:** baixa — reaproveita o pipeline assíncrono via RabbitMQ que já existe para o PDF

---

### 3. Geração de variações de receitas para o e-book

**Dor atacada:** quer vender receitas por e-book.

A partir de uma receita já cadastrada (`RecipeModel`), a IA gera variações (substituições, ajuste de porções, versão vegana/low-carb), acelerando a produção de conteúdo vendável para o e-book de receitas.

- **Módulos afetados:** `RecipeModel`, `RecipeController`, `RecipeAdapter`
- **Custo estimado:** médio
- **Complexidade:** média

---

### 4. Estruturação automática de anamnese

**Dor atacada:** trabalho levado para casa, formulários manuais.

Hoje o `FormController` só faz CRUD bruto — sem processamento analítico de métricas (já marcado como item de roadmap na documentação de negócio do projeto). A nutricionista dita ou cola anotações livres da consulta e a IA estrutura os dados em campos do formulário (`FormModel`).

- **Módulos afetados:** `FormController`, `FormModel`, padrão Observer (`FormSubject`)
- **Custo estimado:** médio
- **Complexidade:** média-alta — exige desenho de schema estruturado de saída (JSON) e validação

---

### 5. Assistente de substituição de alimentos

**Dor atacada:** ações manuais no dia a dia.

Durante a montagem do plano, sugerir substituições equivalentes em macros (ex.: "trocar arroz por batata doce mantendo carboidratos") consultando a própria tabela TACO.

- **Módulos afetados:** `MealService`, tabela `alimentos`
- **Custo estimado:** baixo — pode até ser resolvido sem LLM (busca por similaridade de macros), com IA só na explicação textual
- **Complexidade:** baixa

---

## Encaixe técnico recomendado

O projeto já tem dois precedentes reaproveitáveis para uma futura integração de IA:

1. **Pipeline assíncrono RabbitMQ** (`PdfProducerService` / `PdfConsumerService`, fila `pdf.generation`) — molde para não bloquear a UI em chamadas de IA mais longas (ideias #1 e #3).
2. **Integração Resend** (client HTTP simples, `@Profile("prod")`, chave via variável de ambiente, sem custo em `dev`) — molde para um novo `AiService`: chave de API via variável de ambiente, desabilitado/mockado em `dev` e nos testes, ativo apenas em `prod`.

---

## Trade-off principal a resolver antes de priorizar

O FittNutri é **gratuito** (proposta de valor central do produto). Toda ideia acima tem custo por chamada de API de IA generativa, o que pressiona o modelo de negócio. Isso favorece começar pela **ideia #2** (resumo de evolução) — menor custo por chamada (poucos tokens), maior visibilidade para o paciente, reaproveita infraestrutura assíncrona já existente — antes de avançar para geração de plano completo (#1), que é mais cara e exige mais revisão humana.

---

## Próximos passos (quando for analisar)

- [ ] Decidir modelo de custo: repassar ao usuário (feature paga) vs. absorver custo vs. limitar uso (rate limit por conta, como já existe para login)
- [ ] Escolher provedor de IA (custo, latência, disponibilidade de API no Brasil)
- [ ] Detalhar plano de implementação da ideia escolhida seguindo o fluxo do projeto: analisar → propor plano → aguardar aprovação → implementar incrementalmente
