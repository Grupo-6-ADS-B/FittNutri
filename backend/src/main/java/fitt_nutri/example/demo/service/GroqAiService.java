package fitt_nutri.example.demo.service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Chamada crua à API de chat completions da Groq (compatível com o formato OpenAI).
 * Reaproveitada por qualquer feature de IA do produto (sugestão de dieta, resumo de
 * evolução no PDF, etc.) — cada uma define seu próprio system prompt.
 */
@Slf4j
@Service
public class GroqAiService {

    private static final String SYSTEM_PROMPT_DIETA = """
            Você é um assistente que ajuda nutricionistas a montar rascunhos de planos alimentares.
            Responda SOMENTE com um JSON válido, sem nenhum texto adicional antes ou depois, seguindo
            exatamente este schema:
            {
              "refeicoes": [
                {
                  "descricao": "string (ex: Café da manhã)",
                  "horario": "string (ex: 08:00)",
                  "observacao": "string opcional, pode ser omitido",
                  "alimentos": [
                    { "alimento": "string (nome do alimento em português do Brasil)", "quantidade": number, "unidade": "string (ex: g, ml, unidade)" }
                  ]
                }
              ]
            }
            Use nomes de alimentos comuns e simples em português do Brasil, para facilitar o casamento
            com uma base de dados de alimentos (ex: "Arroz branco cozido", "Peito de frango grelhado").
            """;

    private final RestClient groqRestClient;
    private final String model;

    public GroqAiService(
            RestClient groqRestClient,
            @Value("${groq.model:openai/gpt-oss-120b}") String model) {
        this.groqRestClient = groqRestClient;
        this.model = model;
    }

    public String generateDietSuggestion(String userPrompt) {
        String content = chat(SYSTEM_PROMPT_DIETA, userPrompt, true);
        if (content == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Não foi possível gerar a sugestão de dieta agora. Tente novamente em instantes.");
        }
        return content;
    }

    /**
     * Chamada genérica de texto livre (sem JSON mode) — usada por features que só precisam
     * de um parágrafo em prosa, como o resumo de evolução do paciente no PDF de bioimpedância.
     * Retorna null em caso de falha (chamador decide o fallback; nunca lança exceção).
     */
    public String generateText(String systemPrompt, String userPrompt) {
        return chat(systemPrompt, userPrompt, false);
    }

    private String chat(String systemPrompt, String userPrompt, boolean jsonMode) {
        try {
            ChatResponse response = groqRestClient.post()
                    .uri("/chat/completions")
                    .body(new ChatRequest(
                            model,
                            List.of(
                                    new ChatMessage("system", systemPrompt),
                                    new ChatMessage("user", userPrompt)
                            ),
                            jsonMode ? new ResponseFormat("json_object") : null
                    ))
                    .retrieve()
                    .body(ChatResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()
                    || response.choices().get(0).message() == null) {
                log.warn("A IA (Groq) não retornou nenhuma resposta.");
                return null;
            }

            return response.choices().get(0).message().content();
        } catch (Exception e) {
            log.error("Falha ao chamar a API da Groq: {}", e.getMessage());
            return null;
        }
    }

    private record ChatMessage(String role, String content) {}

    private record ResponseFormat(String type) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private record ChatRequest(
            String model,
            List<ChatMessage> messages,
            @JsonProperty("response_format") ResponseFormat responseFormat
    ) {}

    private record Choice(ChatMessage message) {}

    private record ChatResponse(List<Choice> choices) {}
}
