package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.dto.request.AiEvolutionAnalysisRequestDTO;
import fitt_nutri.example.demo.dto.response.AiEvolutionAnalysisResponseDTO;
import fitt_nutri.example.demo.service.GroqAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class AnalyzePatientEvolutionUseCase {

    private final GroqAiService groqAiService;

    private static final String SYSTEM_PROMPT = """
        Você é um assistente de apoio para nutricionistas.

        Sua função é analisar dados de evolução antropométrica
        de um paciente e produzir um resumo objetivo e profissional.

        Analise:
        - evolução do peso;
        - evolução do IMC;
        - percentual de gordura;
        - massa muscular;
        - gordura visceral; 
        - tendência geral entre as avaliações.

        Regras importantes:
        - Não faça diagnóstico médico.
        - Não prescreva tratamentos.
        - Não invente informações.
        - Não faça suposições sobre erros nos dados sem evidência clara.
        - Se houver poucos dados ou avaliações na mesma data, apenas informe isso.
        - Não use Markdown.
        - Não use símbolos como **, ##, -, *, # ou listas numeradas.
        - Responda em português do Brasil.
        - Seja objetiva e clara.

        Estruture a resposta exatamente em 3 partes:

        RESUMO
        Escreva um parágrafo curto resumindo a evolução encontrada.

        DESTAQUES
        Escreva de 2 a 4 frases curtas destacando as principais mudanças
        ou a estabilidade dos indicadores.

        PONTO DE ATENÇÃO
        Escreva uma frase curta indicando algum ponto que merece
        acompanhamento, caso exista. Se não existir, informe que não há
        pontos de atenção relevantes nos dados apresentados.

        Não coloque títulos adicionais.
        """;

    public AiEvolutionAnalysisResponseDTO execute(
            AiEvolutionAnalysisRequestDTO request) {

        if (request == null ||
                request.getEvolution() == null ||
                request.getEvolution().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Não existem dados de evolução para analisar."
            );
        }

        String userPrompt = buildPrompt(request);

        String analysis = groqAiService.generateText(
                SYSTEM_PROMPT,
                userPrompt
        );

        if (analysis == null || analysis.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Não foi possível gerar a análise com IA. Tente novamente."
            );
        }

        return new AiEvolutionAnalysisResponseDTO(
                analysis.trim()
        );
    }

    private String buildPrompt(
            AiEvolutionAnalysisRequestDTO request) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                Analise a evolução antropométrica abaixo.

                DADOS DAS AVALIAÇÕES:
                """);

        for (AiEvolutionAnalysisRequestDTO.EvolutionDataDTO data :
                request.getEvolution()) {

            prompt.append("\n");

            prompt.append("- Data: ")
                    .append(valueOrDash(data.getDataConsulta()))
                    .append("\n");

            prompt.append("- Peso: ")
                    .append(valueOrDash(data.getPeso()))
                    .append(" kg\n");

            prompt.append("- IMC: ")
                    .append(valueOrDash(data.getImc()))
                    .append("\n");

            prompt.append("- Gordura corporal: ")
                    .append(valueOrDash(data.getGordura()))
                    .append("%\n");

            prompt.append("- Massa muscular: ")
                    .append(valueOrDash(data.getMassaMuscular()))
                    .append("%\n");

            prompt.append("- Gordura visceral: ")
                    .append(valueOrDash(data.getGorduraVisceral()))
                    .append("\n");
        }

        prompt.append("""

                Gere uma análise considerando a evolução entre a primeira
                e a última avaliação e, quando houver avaliações
                intermediárias, considere também a tendência apresentada.

                Não invente dados.
                """);

        return prompt.toString();
    }

    private String valueOrDash(Object value) {
        return value != null ? value.toString() : "-";
    }
}
