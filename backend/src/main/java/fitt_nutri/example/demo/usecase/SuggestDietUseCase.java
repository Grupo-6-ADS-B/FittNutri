package fitt_nutri.example.demo.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealItemDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.DietMealItemModel;
import fitt_nutri.example.demo.model.DietMealModel;
import fitt_nutri.example.demo.model.DietModel;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.PatientHistoryModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.DietRepository;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.service.GroqAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Gera um rascunho de plano alimentar via IA (Groq) com base nos dados antropométricos
 * mais recentes do paciente e em observações livres da nutricionista.
 * Nunca persiste nada — a nutricionista sempre revisa e aplica manualmente
 * (via POST /meals/full-diet/{patientId}).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SuggestDietUseCase {

    private static final int MAX_REFEICOES = 6;
    private static final int MAX_ITENS_POR_REFEICAO = 8;
    private static final int MIN_KEYWORD_LENGTH = 4;

    private final PatientRepository patientRepository;
    private final PatientHistoryRepository patientHistoryRepository;
    private final FoodItensRepository foodItensRepository;
    private final DietRepository dietRepository;
    private final GroqAiService groqAiService;
    private final ObjectMapper objectMapper;

    public FullDietRequestDTO execute(Integer patientId, String observacoes) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        PatientHistoryModel latestHistory =
                patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(patientId);

        DietModel exemplo = findRelevantDietModel(observacoes);

        String userPrompt = buildUserPrompt(patient, latestHistory, observacoes, exemplo);
        log.debug("[SuggestDietUseCase] prompt enviado à IA para patientId={}:\n{}", patientId, userPrompt);
        String rawJson = groqAiService.generateDietSuggestion(userPrompt);

        FullDietRequestDTO draft = parseResponse(rawJson);
        applyGuardrails(draft);
        resolveFoodItems(draft);

        return draft;
    }

    private void verificarPropriedadePaciente(PatientModel patient) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (patient.getNutricionista() == null ||
                !emailLogado.equals(patient.getNutricionista().getEmail())) {
            throw new AccessDeniedException(
                    "Acesso negado: este paciente não pertence ao nutricionista logado");
        }
    }

    /**
     * Busca, entre as dietas-modelo já cadastradas pela equipe (tela "Ver modelos"), a que mais
     * combina com o objetivo/observações digitados — por sobreposição simples de palavras-chave
     * entre o texto livre e o nome/observação do modelo. Sem match relevante, retorna null.
     */
    private DietModel findRelevantDietModel(String observacoes) {
        Set<String> keywords = extractKeywords(observacoes);
        if (keywords.isEmpty()) return null;

        DietModel best = null;
        int bestScore = 0;
        for (DietModel candidate : dietRepository.findAll()) {
            int score = scoreMatch(candidate, keywords);
            if (score > bestScore) {
                bestScore = score;
                best = candidate;
            }
        }
        return best;
    }

    private Set<String> extractKeywords(String texto) {
        if (texto == null || texto.isBlank()) return Set.of();
        Locale ptBr = Locale.forLanguageTag("pt-BR");
        return List.of(texto.toLowerCase(ptBr).split("[^a-zà-ú0-9]+")).stream()
                .filter(palavra -> palavra.length() >= MIN_KEYWORD_LENGTH)
                .collect(Collectors.toSet());
    }

    private int scoreMatch(DietModel diet, Set<String> keywords) {
        Locale ptBr = Locale.forLanguageTag("pt-BR");
        String textoModelo = ((diet.getNome() != null ? diet.getNome() : "") + " " +
                (diet.getObservacao() != null ? diet.getObservacao() : "")).toLowerCase(ptBr);

        int score = 0;
        for (String palavra : keywords) {
            if (textoModelo.contains(palavra)) score++;
        }
        return score;
    }

    /** Monta um bloco de few-shot a partir do modelo salvo, no estilo real desta nutricionista. */
    private String buildFewShotExample(DietModel modelo) {
        StringBuilder sb = new StringBuilder();
        sb.append("Exemplo de como esta nutricionista costuma montar planos (modelo salvo \"")
                .append(modelo.getNome()).append("\"");
        if (modelo.getObservacao() != null && !modelo.getObservacao().isBlank()) {
            sb.append(" — ").append(modelo.getObservacao());
        }
        sb.append("):\n");

        List<DietMealModel> refeicoes = modelo.getRefeicoes() != null ? modelo.getRefeicoes() : List.of();
        int limiteRefeicoes = Math.min(refeicoes.size(), MAX_REFEICOES);
        for (int i = 0; i < limiteRefeicoes; i++) {
            DietMealModel refeicao = refeicoes.get(i);
            sb.append("- ")
                    .append(refeicao.getHorario() != null ? refeicao.getHorario() : "")
                    .append(" ").append(refeicao.getNome()).append(": ")
                    .append(formatarItens(refeicao.getItens()))
                    .append("\n");
        }

        sb.append("Siga um estilo parecido (tipo de alimento, porções), mas gere um plano novo e ")
                .append("completo adaptado aos dados do paciente informados abaixo — não copie o exemplo.\n");
        return sb.toString();
    }

    private String formatarItens(List<DietMealItemModel> itens) {
        if (itens == null || itens.isEmpty()) return "-";
        List<String> partes = new ArrayList<>();
        int limite = Math.min(itens.size(), MAX_ITENS_POR_REFEICAO);
        for (int i = 0; i < limite; i++) {
            DietMealItemModel item = itens.get(i);
            String nomeAlimento = item.getAlimento() != null ? item.getAlimento().getNome() : item.getDescricao();
            if (nomeAlimento == null || nomeAlimento.isBlank()) continue;
            String quantidade = item.getQuantidade() != null
                    ? " (" + item.getQuantidade() + (item.getUnidade() != null ? item.getUnidade() : "") + ")"
                    : "";
            partes.add(nomeAlimento + quantidade);
        }
        return String.join(", ", partes);
    }

    private String buildUserPrompt(
            PatientModel patient, PatientHistoryModel history, String observacoes, DietModel exemplo) {
        StringBuilder sb = new StringBuilder();

        if (exemplo != null) {
            sb.append(buildFewShotExample(exemplo)).append("\n");
        }

        sb.append("Dados do paciente:\n");
        sb.append("- Sexo: ").append(patient.getSexo()).append("\n");
        sb.append("- Nível de atividade física: ").append(patient.getAtividade()).append("\n");
        if (patient.getMotivoConsulta() != null && !patient.getMotivoConsulta().isBlank()) {
            sb.append("- Motivo da consulta: ").append(patient.getMotivoConsulta()).append("\n");
        }

        AnthropometricDataModel dados = history != null ? history.getAnthropometricDataModel() : null;
        if (dados != null) {
            sb.append("- Idade: ").append(dados.getIdade()).append(" anos\n");
            sb.append("- Peso: ").append(dados.getPeso()).append(" kg\n");
            sb.append("- Altura: ").append(dados.getAltura()).append(" m\n");
            sb.append("- IMC: ").append(dados.getImc()).append("\n");
            sb.append("- Percentual de gordura corporal: ").append(dados.getPorcentagemGordura()).append("%\n");
            sb.append("- Gordura visceral: ").append(dados.getGorduraVisceral()).append("\n");
            sb.append("- Taxa metabólica basal (TMB): ").append(dados.getTaxaMetabolicaBasal()).append(" kcal\n");
        } else {
            sb.append("- Nenhum dado antropométrico cadastrado ainda para este paciente.\n");
        }

        if (observacoes != null && !observacoes.isBlank()) {
            sb.append("\nObjetivo/restrições/observações informados pela nutricionista: ")
                    .append(observacoes).append("\n");
        }

        sb.append("\nGere uma sugestão de plano alimentar diário completo (ex: café da manhã, almoço, ")
                .append("lanche da tarde, jantar — ajuste as refeições conforme o caso), respeitando a TMB ")
                .append("e o objetivo/restrições informados. Este é apenas um rascunho que será revisado ")
                .append("por uma nutricionista antes de qualquer uso.");

        return sb.toString();
    }

    private FullDietRequestDTO parseResponse(String rawJson) {
        try {
            return objectMapper.readValue(rawJson, FullDietRequestDTO.class);
        } catch (Exception e) {
            log.error("Resposta da IA não pôde ser interpretada como JSON válido: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "A IA retornou uma resposta em formato inesperado. Tente novamente.");
        }
    }

    private void applyGuardrails(FullDietRequestDTO draft) {
        if (draft.getRefeicoes() == null || draft.getRefeicoes().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "A IA não retornou nenhuma refeição. Tente novamente.");
        }
        if (draft.getRefeicoes().size() > MAX_REFEICOES) {
            draft.setRefeicoes(draft.getRefeicoes().subList(0, MAX_REFEICOES));
        }
        for (MealRequestDTO meal : draft.getRefeicoes()) {
            if (meal.getAlimentos() != null && meal.getAlimentos().size() > MAX_ITENS_POR_REFEICAO) {
                meal.setAlimentos(meal.getAlimentos().subList(0, MAX_ITENS_POR_REFEICAO));
            }
        }
    }

    /** Tenta casar cada alimento sugerido com um item real da base (TACO/custom) por nome. */
    private void resolveFoodItems(FullDietRequestDTO draft) {
        for (MealRequestDTO meal : draft.getRefeicoes()) {
            if (meal.getAlimentos() == null) continue;
            for (MealItemDTO item : meal.getAlimentos()) {
                if (item.getAlimento() == null || item.getAlimento().isBlank()) continue;
                List<FoodItensModel> matches =
                        foodItensRepository.findByNomeContainingIgnoreCase(item.getAlimento());
                if (!matches.isEmpty()) {
                    item.setFoodItemId(matches.get(0).getId());
                }
            }
        }
    }
}
