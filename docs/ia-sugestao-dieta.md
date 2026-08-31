# Sugestão de Dieta via IA — Especificação Técnica

> Documentação de como a FittNutri usa IA generativa para apoiar a nutricionista na criação de planos alimentares. Cobre a escolha do provedor (Groq), a arquitetura, o fluxo completo (frontend → backend → IA → volta) e as regras de segurança/guardrails aplicadas.

---

## 0. Explicação simples (pra contar pra alguém)

> A ideia foi usar IA pra ajudar a nutricionista a não começar do zero toda vez que precisa montar uma dieta. Funciona assim:
>
> Quando a nutricionista clica em "Sugerir plano com IA", ela pode escrever uma observação rápida tipo "paciente quer emagrecer, é vegetariano". Aí o sistema pega isso e junta com os dados que já estão cadastrados do paciente — peso, altura, idade, nível de atividade física, taxa metabólica — e monta um "pedido" em texto, tipo assim: "esse é o paciente, esses são os dados dele, e é isso que a nutricionista quer, monta uma dieta completa pra ele".
>
> Esse texto eu mando pra uma IA chamada Groq — que é tipo o ChatGPT, mas mais rápida e mais barata, e eu escolhi ela justamente por isso: porque a nutricionista fica esperando na tela, então precisa ser rápido.
>
> A IA devolve a dieta pronta em formato de dados (JSON), com as refeições, horários e alimentos. Aí o meu sistema pega isso, confere se não veio nada estranho ou exagerado (tipo, limito pra no máximo 6 refeições, pra IA não inventar demais), e tenta casar cada alimento sugerido com os alimentos que já tenho cadastrados no banco (a tabela TACO).
>
> E o mais importante: **a IA nunca salva nada sozinha**. Ela só gera um rascunho. Esse rascunho abre numa tela de edição, e a nutricionista revisa, ajusta o que quiser, e só quando ela confirma que salva de verdade no sistema. A IA é uma ajuda pra acelerar o trabalho, não pra substituir a decisão da nutricionista.

As seções abaixo detalham tecnicamente cada uma dessas etapas.

---

## 1. Objetivo da funcionalidade

A IA **não cria a dieta final** — ela gera um **rascunho** (draft) de plano alimentar diário com base:

- nos dados cadastrais do paciente (sexo, atividade física, motivo da consulta);
- na antropometria mais recente (peso, altura, IMC, % de gordura, TMB etc.);
- em observações livres digitadas pela nutricionista no momento da geração (objetivo, restrições, preferências);
- opcionalmente, no estilo de uma dieta-modelo já cadastrada pela própria equipe, usada como *few-shot* (ver seção 5).

O rascunho é sempre revisado e editado pela nutricionista antes de ser salvo. **Nada gerado pela IA é persistido automaticamente no banco.**

Existe uma segunda feature, menor, que também usa IA: o resumo em linguagem natural da evolução do paciente no PDF de bioimpedância (seção 8). O foco principal deste documento é a sugestão de dieta.

---

## 2. Por que Groq

| Critério | Groq | Justificativa da escolha |
|---|---|---|
| Latência | Inferência em LPU (não GPU), ordem de segundos para respostas longas | A geração acontece de forma **síncrona** dentro de uma requisição HTTP (a nutricionista fica esperando na tela) — não há fila/async como no PDF. Baixa latência é obrigatório. |
| Custo | Camada gratuita generosa / preço por token baixo | Projeto de squad pequeno, sem orçamento para chamadas de alto custo por sugestão. |
| Compatibilidade de API | Endpoint `/chat/completions` **compatível com o formato OpenAI** (`ChatMessage(role, content)`, `response_format: json_object`) | Permite trocar de provedor no futuro (ex: voltar para OpenAI, ou usar outro compatível) alterando só a `baseUrl` e a chave, sem reescrever `GroqAiService`. |
| Modelo usado | `openai/gpt-oss-120b` (configurável via `GROQ_MODEL`) | Modelo open-weight hospedado na Groq, bom equilíbrio entre qualidade de raciocínio (matemática simples de macros/TMB) e velocidade. |
| JSON mode nativo | Suporte a `response_format: { type: "json_object" }` | Essencial para a sugestão de dieta: a resposta precisa ser JSON parseável de forma confiável (ver seção 6). |

Não há motor de IA proprietário nem fine-tuning — é uma chamada direta à API pública da Groq, com todo o "conhecimento de domínio" (regras de negócio, formato de saída, dados do paciente) injetado via *prompt engineering* a cada chamada.

---

## 3. Arquitetura — componentes envolvidos

```
Frontend (React)
  AiDietSuggestionModal.jsx
        │  POST /meals/suggest-diet/{patientId}  { observacoes }
        ▼
Backend (Spring Boot)
  MealController                (endpoint REST, @PreAuthorize hasRole('NUTRI'))
        │
        ▼
  SuggestDietUseCase            (orquestra: busca dados, monta prompt, valida resposta)
        │
        ├─► PatientRepository / PatientHistoryRepository   (dados do paciente + antropometria)
        ├─► DietRepository                                  (dietas-modelo p/ few-shot)
        ├─► FoodItensRepository                              (casa alimento sugerido ↔ base TACO/custom)
        │
        ▼
  GroqAiService                 (monta o payload OpenAI-like e chama a Groq)
        │
        ▼
  AiConfig → RestClient          (bean com baseUrl + Authorization: Bearer GROQ_API_KEY)
        │
        ▼
  Groq API  (https://api.groq.com/openai/v1/chat/completions)
```

Arquivos-chave:

| Arquivo | Responsabilidade |
|---|---|
| `backend/.../config/AiConfig.java` | Cria o `RestClient` HTTP com a `baseUrl` da Groq e o header `Authorization` já injetado. |
| `backend/.../service/GroqAiService.java` | Encapsula a chamada crua à API (payload, JSON mode, tratamento de erro). Reutilizável por qualquer feature de IA. |
| `backend/.../usecase/SuggestDietUseCase.java` | Regra de negócio: monta o prompt, aplica guardrails na resposta, resolve os alimentos na base local. |
| `backend/.../controller/MealController.java` | Expõe `POST /meals/suggest-diet/{patientId}`. |
| `frontend/src/components/AiDietSuggestionModal.jsx` | UI: campo de observações + chamada à API + abre o editor de dieta com o rascunho para revisão. |

---

## 4. Fluxo passo a passo

1. **Nutricionista** abre a tela do paciente e clica em "Sugerir plano com IA". O campo de observações já vem pré-preenchido com o "motivo da consulta" cadastrado (pode editar).
2. **Frontend** chama `POST /meals/suggest-diet/{patientId}` com `{ "observacoes": "..." }` (campo opcional).
3. **`MealController`** valida que o usuário logado tem role `NUTRI` (`@PreAuthorize`) e delega para `SuggestDietUseCase.execute(patientId, observacoes)`.
4. **`SuggestDietUseCase`**:
   a. Busca o paciente e **valida que ele pertence ao nutricionista logado** (`verificarPropriedadePaciente` — evita IDOR entre nutricionistas diferentes).
   b. Busca o histórico antropométrico mais recente do paciente.
   c. Tenta achar, entre as dietas-modelo já salvas pela equipe, a que mais combina com as palavras-chave das observações (`findRelevantDietModel` — matching simples por sobreposição de palavras ≥ 4 letras). Se achar, usa como exemplo *few-shot*.
   d. Monta o **prompt do usuário** (`buildUserPrompt`) concatenando: exemplo few-shot (se houver) + dados do paciente + antropometria + observações + instrução final.
   e. Chama `GroqAiService.generateDietSuggestion(prompt)`.
5. **`GroqAiService`** envia ao endpoint `/chat/completions` da Groq:
   - `model`: valor de `GROQ_MODEL` (padrão `openai/gpt-oss-120b`);
   - `messages`: `[{role: system, content: SYSTEM_PROMPT_DIETA}, {role: user, content: promptMontado}]`;
   - `response_format: { type: "json_object" }` — força a Groq a devolver **apenas JSON válido**.
6. A Groq responde; `GroqAiService` extrai `choices[0].message.content` (a string JSON) ou retorna `null`/loga erro em caso de falha de rede/timeout.
7. **`SuggestDietUseCase`**:
   - Se a resposta for `null` → `502 Bad Gateway` ("Não foi possível gerar a sugestão de dieta agora...").
   - Faz `parseResponse`: desserializa o JSON em `FullDietRequestDTO`. Se não for um JSON válido no schema esperado → `502 Bad Gateway`.
   - **Guardrails** (`applyGuardrails`): garante que veio ao menos 1 refeição; corta em no máximo **6 refeições** e **8 itens por refeição**, mesmo que a IA "alucine" e devolva mais.
   - **Resolução de alimentos** (`resolveFoodItems`): para cada alimento sugerido (string livre, ex: "Peito de frango grelhado"), tenta casar por `LIKE` (case-insensitive) com a base de alimentos (TACO + customizados do nutricionista) e preenche `foodItemId` quando encontra. Alimentos sem match ficam com `foodItemId: null` — a nutricionista resolve manualmente na tela de edição.
8. O `FullDietRequestDTO` (rascunho) volta como `200 OK` para o frontend.
9. **Frontend** abre o `DietEditorModal` já preenchido com o rascunho, permitindo a nutricionista editar refeições, horários, quantidades e substituir/casar alimentos antes de salvar.
10. Só quando a nutricionista clica em salvar é que os dados são persistidos, via `POST /meals/full-diet/{patientId}` (endpoint separado, não relacionado à IA).

```
Nutri            Frontend                Backend                          Groq API
 │  clica          │                        │                                 │
 │ "Sugerir com IA"│                        │                                 │
 │────────────────►│ POST /suggest-diet/{id}│                                 │
 │                 │───────────────────────►│                                 │
 │                 │                        │ valida ownership + monta prompt│
 │                 │                        │────────────────────────────────►│
 │                 │                        │        JSON da dieta            │
 │                 │                        │◄────────────────────────────────│
 │                 │                        │ guardrails + resolve alimentos │
 │                 │◄───────────────────────│  200 OK (FullDietRequestDTO)   │
 │  revisa/edita   │◄── abre DietEditorModal│                                 │
 │────────────────►│ POST /meals/full-diet/{id} (se confirmar)                │
```

---

## 5. Engenharia de prompt

### 5.1 System prompt (fixo, definido em `GroqAiService`)

Instrui o modelo a agir como assistente de nutricionistas e a responder **exclusivamente** em JSON, com o schema exato:

```json
{
  "refeicoes": [
    {
      "descricao": "string (ex: Café da manhã)",
      "horario": "string (ex: 08:00)",
      "observacao": "string opcional",
      "alimentos": [
        { "alimento": "string em português do Brasil", "quantidade": number, "unidade": "string (g, ml, unidade)" }
      ]
    }
  ]
}
```

Pede explicitamente **nomes de alimentos simples e comuns em português do Brasil** (ex: "Arroz branco cozido") — isso é o que permite o casamento por texto com a base TACO/customizada no passo 7 do fluxo.

### 5.2 User prompt (dinâmico, montado por `buildUserPrompt`)

Composto, na ordem:

1. **Few-shot opcional** — se uma dieta-modelo relevante for encontrada, um resumo dela (horário, nome da refeição, itens) é incluído como exemplo de estilo, com a instrução explícita de **não copiar**, apenas seguir o padrão.
2. **Dados fixos do paciente** — sexo, nível de atividade, motivo da consulta.
3. **Antropometria mais recente** (se existir) — idade, peso, altura, IMC, % de gordura, gordura visceral, TMB. Se não houver histórico, informa isso explicitamente ("Nenhum dado antropométrico cadastrado ainda").
4. **Observações livres da nutricionista** (objetivo, restrições) — só incluídas se preenchidas.
5. **Instrução final** — pede um plano diário completo, respeitando a TMB e o objetivo/restrições, reforçando que é "apenas um rascunho que será revisado por uma nutricionista".

### 5.3 Por que não usar function calling / tools da Groq

A abordagem escolhida foi **JSON mode + parsing manual + guardrails no código**, em vez de depender de function calling. Isso mantém o `GroqAiService` genérico (reaproveitado também para texto livre no PDF) e concentra toda a validação de negócio (limites de itens, ownership, resolução de alimentos) no `SuggestDietUseCase`, em Java — mais fácil de testar e evoluir do que confiar 100% no modelo.

---

## 6. Contrato do endpoint

**`POST /meals/suggest-diet/{patientId}`** — requer JWT com role `NUTRI`.

Request body (opcional):
```json
{ "observacoes": "Paciente vegetariano, quer emagrecer" }
```

Response `200 OK`:
```json
{
  "refeicoes": [
    {
      "descricao": "Café da manhã",
      "horario": "07:30",
      "observacao": null,
      "alimentos": [
        { "alimento": "Aveia em flocos", "quantidade": 30.0, "unidade": "g", "foodItemId": 921 },
        { "alimento": "Banana prata", "quantidade": 1.0, "unidade": "unidade", "foodItemId": null }
      ]
    }
  ]
}
```

Erros possíveis:
| Status | Causa |
|---|---|
| `403 Forbidden` | Usuário autenticado não tem role `NUTRI`, ou o paciente não pertence ao nutricionista logado (`AccessDeniedException`). |
| `404 Not Found` | `patientId` não existe. |
| `502 Bad Gateway` | Groq não respondeu, respondeu vazio, ou devolveu algo que não é um JSON válido no schema esperado. |

---

## 7. Configuração e variáveis de ambiente

| Variável | Onde é usada | Padrão |
|---|---|---|
| `GROQ_API_KEY` | `AiConfig` → header `Authorization: Bearer ...` do `RestClient` | nenhum (sem ela, toda chamada falha de forma controlada com 502) |
| `GROQ_MODEL` | `GroqAiService` (injetado via `@Value("${groq.model}")`) | `openai/gpt-oss-120b` |

Mapeamento em `application.properties` (dev) e `application-prod.properties` (prod) — ambos apontam para as mesmas env vars, só o valor default de fallback muda:

```properties
groq.api-key=${GROQ_API_KEY:}
groq.model=${GROQ_MODEL:openai/gpt-oss-120b}
```

No `docker-compose.dev.yml`, essas variáveis são passadas ao container do backend a partir do `.env`:
```yaml
GROQ_API_KEY: ${GROQ_API_KEY:-}
GROQ_MODEL: ${GROQ_MODEL:-openai/gpt-oss-120b}
```

A chave é obtida em [console.groq.com](https://console.groq.com) e **nunca deve ser commitada** — fica só no `.env` local (dev) ou no gerenciador de secrets em produção.

---

## 8. Segunda feature de IA: resumo de evolução no PDF

O mesmo `GroqAiService` é reutilizado por `BioimpedancePdfService` para gerar um parágrafo em linguagem natural comparando a consulta atual com a anterior, incluído na seção "Evolução em Palavras" do PDF de bioimpedância.

Diferenças em relação à sugestão de dieta:
- Usa `generateText(systemPrompt, userPrompt)` — **sem** JSON mode, retorna prosa livre (3 a 5 frases, sem markdown).
- **Nunca falha a geração do PDF**: se a IA não responder, a seção é simplesmente omitida (`try/catch` que engole a exceção) — o restante do relatório (tabela numérica de evolução + conclusão fixa) já cobre o essencial.

Essa diferença de postura é intencional: a sugestão de dieta é uma ação explícita e síncrona da nutricionista (deve informar erro claramente), enquanto o resumo no PDF é um "extra" opcional dentro de um documento maior (falha silenciosa é preferível a quebrar a geração do PDF inteiro).

---

## 9. Guardrails e segurança — resumo

- **Autorização**: `@PreAuthorize("hasRole('NUTRI')")` no controller + verificação de propriedade do paciente (`verificarPropriedadePaciente`) no use case — impede uma nutricionista de gerar/ver sugestões de pacientes de outra.
- **Limite de tamanho da resposta**: no máximo 6 refeições, 8 itens por refeição, mesmo que a IA devolva mais.
- **Validação de schema**: resposta que não parseia como `FullDietRequestDTO` é rejeitada com 502 em vez de propagar erro bruto ou salvar lixo.
- **Nada é persistido automaticamente**: o rascunho só é salvo se a nutricionista revisar e confirmar explicitamente.
- **Sem dados sensíveis desnecessários no prompt**: o prompt usa dados clínicos relevantes (antropometria, objetivo) mas não inclui CPF, e-mail, telefone ou outros dados pessoais do paciente.

---

## 10. Como testar manualmente

```bash
# 1. Login como nutricionista (obter JWT)
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@exemplo.com","senha":"SuaSenha123!"}'

# 2. Chamar a sugestão de dieta (usar o token retornado acima)
curl -X POST "http://localhost:8080/meals/suggest-diet/<patientId>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"observacoes":"Paciente quer ganhar massa muscular, sem restricoes"}'
```

Resposta esperada: `200 OK` com um JSON de refeições em ~2-5 segundos.

---

## 11. Limitações conhecidas / possíveis evoluções futuras

- **Matching de alimentos por `LIKE` simples**: pode não encontrar o item certo se a IA usar um nome ligeiramente diferente do cadastrado na base (ex.: "Frango grelhado" vs "Peito de frango grelhado"). Hoje a nutricionista precisa ajustar manualmente no editor quando `foodItemId` vem `null`.
- **Sem streaming**: a resposta só chega completa ao final — para planos grandes, a espera é percebida como um bloco só (não há efeito "digitando").
- **Sem histórico de conversas**: cada chamada é stateless — não há "refinar a sugestão anterior", cada clique gera do zero.
- **Modelo fixo por variável de ambiente**: trocar de modelo Groq (ex. para um mais barato ou mais capaz) não requer deploy de código, só mudar `GROQ_MODEL` — mas não há fallback automático entre modelos.
