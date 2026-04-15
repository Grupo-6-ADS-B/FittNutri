# Levantamento de Melhorias — FittNutri

**Data da análise:** 2026-04-15  
**Branch analisada:** `dev`  
**Responsável pelo levantamento:** Claude Code (análise estática do código)

---

## Sumário

| # | Área | Problema | Impacto | Esforço |
|---|---|---|---|---|
| 1 | Backend | `@Valid` ausente nos controllers | Alto | Baixo |
| 2 | Frontend | Chave duplicada `idade` no estado React | Médio | Baixo |
| 3 | Backend | Dupla consulta ao banco em `UserService` | Médio | Baixo |
| 4 | Backend | `.get()` inseguro em `UserService.updateUser` | Médio | Baixo |
| 5 | Backend | `findAll()` chamado duas vezes em `AnthropometricDataService` | Médio | Baixo |
| 6 | Backend | Exceções com nome semântico errado | Médio | Baixo |
| 7 | Backend | Lógica de validação duplicada | Médio | Baixo |
| 8 | Backend | Injeção de dependência inconsistente | Baixo | Baixo |
| 9 | Backend | Rate limiter in-memory não escala | Alto | Médio |
| 10 | Backend | IMC calculado no frontend, não no backend | Médio | Médio |
| 11 | Geral | Ausência de testes automatizados | Alto | Alto |

---

## Detalhamento

---

### 1. `@Valid` ausente nos controllers

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/controller/PatientController.java`  
**Linhas:** 37, 73 (`createPatient` e `updatePatient`)

**Problema:**  
Os métodos de criação e atualização de paciente recebem um `PatientRequestDTO` anotado com `@RequestBody`, mas sem `@Valid`. Isso significa que as anotações de validação do DTO (`@NotBlank`, `@Email`, `@CPF`, etc.) são completamente ignoradas — qualquer dado, mesmo inválido, passa direto para o banco.

**Como está:**
```java
public ResponseEntity<PatientResponseDTO> createPatient(@RequestBody PatientRequestDTO dto)
public ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable Integer id, @RequestBody PatientRequestDTO dto)
```

**Como deve ficar:**
```java
public ResponseEntity<PatientResponseDTO> createPatient(@Valid @RequestBody PatientRequestDTO dto)
public ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable Integer id, @Valid @RequestBody PatientRequestDTO dto)
```

**Impacto se não corrigido:** Pacientes podem ser cadastrados sem nome, com e-mail inválido ou com CPF inválido, corrompendo a base de dados.

---

### 2. Chave duplicada `idade` no estado React

**Arquivo:** `frontend/src/Pages/UserGestor.jsx`  
**Linhas:** 79 e 83 (antes da correção)

**Problema:**  
O objeto de estado `updateForm` declarava o campo `idade: ""` duas vezes. Em JavaScript, quando um objeto tem chaves duplicadas, a segunda declaração silenciosamente sobrescreve a primeira. O React não lança erro — o campo simplesmente pode se comportar de forma imprevisível no formulário de atualização de paciente.

**Como estava:**
```javascript
const [updateForm, setUpdateForm] = useState({
  id: null,
  name: "",
  idade: "",          // declaração 1
  motivoConsulta: "",
  peso: "",
  altura: "",
  idade: "",          // declaração 2 — sobrescreve a primeira
  idadeMetabolica: "",
  ...
});
```

**Status:** ✅ **Já corrigido** — a declaração duplicada foi removida em 2026-04-15.

---

### 3. Dupla consulta ao banco em `UserService.login`

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/service/UserService.java`  
**Linhas:** 173–179

**Problema:**  
O método `login` chama `findByEmail` duas vezes: uma para verificar se o usuário existe e outra para obtê-lo. São duas queries SQL desnecessárias.

**Como está:**
```java
public UserModel login(LoginRequestDTO dto) {
    if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
        UserModel user = userRepository.findByEmail(dto.getEmail()).get(); // segunda query
        ...
    }
}
```

**Como deve ficar:**
```java
public UserModel login(LoginRequestDTO dto) {
    UserModel user = userRepository.findByEmail(dto.getEmail())
            .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
    if (!passwordEncoder.matches(dto.getSenha(), user.getSenha())) {
        throw new ConflictException("Senha incorreta");
    }
    return user;
}
```

---

### 4. `.get()` sem Optional em `UserService.updateUser`

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/service/UserService.java`  
**Linhas:** 86–91

**Problema:**  
O método verifica `existsById` e logo depois chama `.get()` diretamente no `Optional`, sem tratamento. São duas queries ao banco onde bastaria uma, e o `.get()` é considerado má prática em Java moderno.

**Como está:**
```java
if (!userRepository.existsById(id)) {
    throw new NotFoundException("Usuário não encontrado");
}
UserModel user = userRepository.findById(id).get(); // frágil
```

**Como deve ficar:**
```java
UserModel user = userRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
```

O mesmo padrão existe em `patchUser` (linha 115). Ambos devem ser corrigidos.

---

### 5. `findAll()` chamado duas vezes em `AnthropometricDataService`

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/service/AnthropometricDataService.java`  
**Linhas:** 35–40

**Problema:**  
O método `listAll` executa duas queries SQL idênticas: uma para verificar se a lista está vazia e outra para retorná-la.

**Como está:**
```java
public List<AnthropometricDataModel> listAll() {
    if (repository.findAll().isEmpty()) {          // query 1
        throw new NotFoundUser("Nenhum dado antropométrico cadastrado");
    }
    return repository.findAll();                   // query 2
}
```

**Como deve ficar:**
```java
public List<AnthropometricDataModel> listAll() {
    List<AnthropometricDataModel> lista = repository.findAll();
    if (lista.isEmpty()) {
        throw new NotFoundUser("Nenhum dado antropométrico cadastrado");
    }
    return lista;
}
```

---

### 6. Exceções com nome semântico errado

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/service/AnthropometricDataService.java`  
**Linhas:** 53–67 (método `create`) e 120–134 (método `partialUpdate`)

**Problema:**  
Erros de validação de range (altura inválida, peso inválido, etc.) estão lançando `NotFoundData`, que representa "recurso não encontrado" e retorna HTTP 404. O correto para erro de valor inválido é HTTP 400 Bad Request, via `InvalidDataException`.

**Como está:**
```java
if (data.getAltura() > 2.60 || data.getAltura() <= 0) {
    throw new NotFoundData("Altura inválida"); // HTTP 404 — errado
}
```

**Como deve ficar:**
```java
if (data.getAltura() > 2.60 || data.getAltura() <= 0) {
    throw new InvalidDataException("Altura inválida"); // HTTP 400 — correto
}
```

Afeta todos os campos validados: `altura`, `peso`, `taxaMetabolicaBasal`, `porcentagemGordura`, `gorduraVisceral`.

---

### 7. Lógica de validação duplicada

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/service/AnthropometricDataService.java`  
**Linhas:** 53–67 (`create`) e 120–134 (`partialUpdate`)

**Problema:**  
Os mesmos blocos `if` de validação (altura, peso, taxa metabólica, etc.) estão copiados em dois métodos. Se um limite mudar (ex.: peso máximo de 300 para 350), precisa ser alterado em dois lugares — risco de inconsistência.

**Como deve ficar:**
Extrair para um método privado reutilizável:
```java
private void validarLimitesCorporais(AnthropometricDataModel data) {
    if (data.getAltura() > 2.60 || data.getAltura() <= 0)
        throw new InvalidDataException("Altura inválida");
    if (data.getPeso() > 300.2 || data.getPeso() <= 0)
        throw new InvalidDataException("Peso inválido");
    if (data.getTaxaMetabolicaBasal() > 3000 || data.getTaxaMetabolicaBasal() <= 0)
        throw new InvalidDataException("Taxa Metabólica inválida");
    if (data.getPorcentagemGordura() > 100 || data.getPorcentagemGordura() <= 0)
        throw new InvalidDataException("Percentual de gordura inválido");
    if (data.getGorduraVisceral() > 60)
        throw new InvalidDataException("Gordura visceral inválida");
}
```

---

### 8. Injeção de dependência inconsistente

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/service/AnthropometricDataService.java`  
**Linhas:** 22–24

**Problema:**  
`AnthropometricDataService` usa `@Autowired` em campos (field injection), enquanto todos os outros services do projeto usam constructor injection via `@RequiredArgsConstructor` do Lombok. Field injection dificulta testes unitários e é considerado má prática no Spring moderno.

**Como está:**
```java
@Service
public class AnthropometricDataService {
    @Autowired
    private AnthropometricDataRepository repository;
    @Autowired
    private PatientRepository patientRepository;
```

**Como deve ficar:**
```java
@Service
@RequiredArgsConstructor
public class AnthropometricDataService {
    private final AnthropometricDataRepository repository;
    private final PatientRepository patientRepository;
```

---

### 9. Rate limiter in-memory não escala

**Arquivo:** `backend/src/main/java/fitt_nutri/example/demo/config/LoginRateLimiter.java`

**Problema:**  
O rate limiter de login usa `ConcurrentHashMap` em memória (Bucket4j). Isso funciona em desenvolvimento, mas tem dois problemas em produção:

- **Reinício do servidor:** todos os contadores são zerados — um atacante pode aguardar um restart (ou provocar) para zerar seu histórico de tentativas
- **Múltiplas instâncias (Auto Scaling no AWS ALB):** cada instância tem seu próprio mapa. Com 3 instâncias, o limite real vira 15 tentativas por minuto, não 5

**Soluções possíveis:**
1. Migrar para **Bucket4j com Redis** como backend de estado compartilhado
2. Usar **AWS WAF** (Web Application Firewall) configurado no ALB para rate limiting por IP — não depende da aplicação
3. Combinação de ambos para proteção em camadas

**Prioridade:** Alta para produção com Auto Scaling ativo.

---

### 10. IMC calculado no frontend

**Arquivo:** `frontend/src/utils/userGestorUtils.js` (função `computeImc`)  
**Referenciado em:** `frontend/src/Pages/UserGestor.jsx` (linha 381)

**Problema:**  
O IMC é calculado no frontend e enviado como campo no payload para o backend. Isso significa que a API aceita qualquer valor de IMC enviado pelo cliente — não há validação ou recálculo no servidor.

**Riscos:**
- Um cliente malicioso pode enviar um IMC arbitrário, corrompendo dados clínicos
- Se a fórmula do frontend estiver errada, todos os registros históricos terão IMC incorreto

**Como deve ficar:**  
O backend deve **ignorar o campo `imc` no request** e calculá-lo internamente a partir de `peso` e `altura` antes de persistir. O campo pode ser mantido no response para exibição.

---

### 11. Ausência de testes automatizados

**Escopo:** Todo o backend

**Problema:**  
O projeto não possui testes unitários nem de integração identificáveis. Para um sistema que manipula dados clínicos de pacientes (`AnthropometricDataService`, `UserService`, `PatientController`), a ausência de testes representa risco real em produção — especialmente com `ddl-auto=update` que pode alterar o schema silenciosamente.

**O que implementar (por prioridade):**

1. **Testes unitários** nos services mais críticos:
   - `UserService` — criação, atualização, verificação de propriedade (IDOR)
   - `AnthropometricDataService` — validações de limites corporais
   - `LoginRateLimiter` — comportamento do rate limiting

2. **Testes de integração** nos controllers principais:
   - `PatientController` — CRUD completo com autenticação
   - `AnthropometricDataController` — criação e atualização por paciente

3. **Ferramentas recomendadas** (já no ecossistema Spring Boot):
   - `@ExtendWith(MockitoExtension.class)` para testes unitários
   - `@SpringBootTest` + `MockMvc` para testes de integração
   - `@DataJpaTest` para testes de repositório

---

## Itens já corrigidos

| Item | Correção | Data |
|---|---|---|
| Chave duplicada `idade` no `UserGestor.jsx` | Declaração duplicada removida | 2026-04-15 |
| Encoding UTF-8 ausente no MySQL e JDBC | `utf8mb4` + `characterEncoding=UTF-8` adicionados | 2026-04-14 |
| Health check do MySQL com timeout insuficiente | `start_period: 120s` e `retries: 10` adicionados | 2026-04-14 |

---

## Como contribuir com as correções

1. Crie uma branch a partir de `dev`: `git checkout -b fix/nome-da-melhoria`
2. Implemente a correção descrita neste documento
3. Abra um PR para `dev` com referência ao número do item (ex.: `fix #3 — remover dupla query em UserService`)
4. Solicite revisão de outro membro antes do merge
