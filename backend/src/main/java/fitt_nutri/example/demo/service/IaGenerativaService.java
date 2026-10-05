package fitt_nutri.example.demo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class IaGenerativaService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public IaGenerativaService(ChatClient.Builder chatClientBuilder,
                               ObjectMapper objectMapper) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public AnaliseNutricionalIA analisar(DadosPacienteIA dados) {
        final String dadosJson = toJson(dados);

        return chatClient.prompt()
                .system("""
                        Você é um assistente de apoio do sistema FittNutri.

                        Sua função é PROCESSAR informações fornecidas pelo backend
                        e gerar apoio à regra de negócio para o nutricionista.

                        Regras obrigatórias:
                        1. Não altere nem recalcule IMC, TMB ou calorias.
                        2. Considere os valores recebidos do backend como fonte de verdade.
                        3. Não invente dados que não estejam no contexto.
                        4. Respeite as restrições alimentares informadas.
                        5. Gere sugestões gerais para apoio profissional.
                        6. Não apresente diagnóstico médico.
                        7. Seja objetivo.
                        """)
                .user("""
                        Analise os dados abaixo e produza uma análise estruturada
                        para apoiar o nutricionista.

                        Dados do paciente:
                        %s

                        Classifique o perfil considerando o objetivo informado.
                        Gere:
                        - classificação do perfil;
                        - nível de atenção (BAIXO, MODERADO ou ALTO);
                        - resumo;
                        - insights;
                        - sugestões;
                        - alertas.
                        """.formatted(dadosJson))
                .call()
                .entity(AnaliseNutricionalIA.class);
    }

    private String toJson(DadosPacienteIA dados) {
        try {
            return objectMapper.writeValueAsString(dados);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "Não foi possível preparar os dados para a IA.", exception);
        }
    }
}
