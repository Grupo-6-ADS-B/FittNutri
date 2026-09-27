package fitt_nutri.example.demo.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.DietMealItemModel;
import fitt_nutri.example.demo.model.DietMealModel;
import fitt_nutri.example.demo.model.DietModel;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.PatientHistoryModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.DietRepository;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.service.GroqAiService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SuggestDietUseCaseTest {

    private SuggestDietUseCase useCase;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientHistoryRepository patientHistoryRepository;

    @Mock
    private FoodItensRepository foodItensRepository;

    @Mock
    private DietRepository dietRepository;

    @Mock
    private GroqAiService groqAiService;

    private PatientModel paciente;
    private UserModel nutricionista;

    @BeforeEach
    void setUp() {
        useCase = new SuggestDietUseCase(
                patientRepository, patientHistoryRepository, foodItensRepository, dietRepository,
                groqAiService, new ObjectMapper());

        nutricionista = new UserModel();
        nutricionista.setEmail("nutri@test.com");

        paciente = new PatientModel();
        paciente.setId(10);
        paciente.setNutricionista(nutricionista);
        paciente.setSexo("Feminino");
        paciente.setAtividade("Moderada");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("nutri@test.com", null, List.of())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("execute - paciente não encontrado deve lançar NotFoundException")
    void execute_PacienteNaoEncontrado() {
        when(patientRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> useCase.execute(10, "emagrecimento"));
        verifyNoInteractions(groqAiService);
    }

    @Test
    @DisplayName("execute - paciente de outro nutricionista deve lançar AccessDeniedException")
    void execute_PacienteDeOutroNutricionista() {
        UserModel outroNutri = new UserModel();
        outroNutri.setEmail("outro@test.com");
        paciente.setNutricionista(outroNutri);
        when(patientRepository.findById(10)).thenReturn(Optional.of(paciente));

        assertThrows(AccessDeniedException.class, () -> useCase.execute(10, null));
        verifyNoInteractions(groqAiService);
    }

    @Test
    @DisplayName("execute - resposta da IA malformada deve virar 502 tratado")
    void execute_RespostaInvalidaDaIA() {
        when(patientRepository.findById(10)).thenReturn(Optional.of(paciente));
        when(patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(10)).thenReturn(null);
        when(groqAiService.generateDietSuggestion(anyString())).thenReturn("isto não é um JSON válido");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> useCase.execute(10, null));
        assertEquals(502, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("execute - resposta sem refeições deve virar 502 tratado")
    void execute_RespostaSemRefeicoes() {
        when(patientRepository.findById(10)).thenReturn(Optional.of(paciente));
        when(patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(10)).thenReturn(null);
        when(groqAiService.generateDietSuggestion(anyString())).thenReturn("{\"refeicoes\": []}");

        assertThrows(ResponseStatusException.class, () -> useCase.execute(10, null));
    }

    @Test
    @DisplayName("execute - resposta válida deve resolver foodItemId por nome quando encontrado")
    void execute_RespostaValidaResolveFoodItemId() {
        String json = """
                {
                  "refeicoes": [
                    {
                      "descricao": "Café da manhã",
                      "horario": "08:00",
                      "alimentos": [
                        { "alimento": "Arroz branco cozido", "quantidade": 100, "unidade": "g" }
                      ]
                    }
                  ]
                }
                """;

        PatientHistoryModel history = new PatientHistoryModel();
        AnthropometricDataModel dados = new AnthropometricDataModel();
        dados.setIdade(30);
        dados.setPeso(65.0);
        dados.setAltura(1.65);
        dados.setImc(23.9);
        dados.setTaxaMetabolicaBasal(1400.0);
        history.setAnthropometricDataModel(dados);

        FoodItensModel arroz = new FoodItensModel();
        arroz.setId(99);
        arroz.setNome("Arroz branco cozido");

        when(patientRepository.findById(10)).thenReturn(Optional.of(paciente));
        when(patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(10)).thenReturn(history);
        when(groqAiService.generateDietSuggestion(anyString())).thenReturn(json);
        when(foodItensRepository.findByNomeContainingIgnoreCase("Arroz branco cozido"))
                .thenReturn(List.of(arroz));

        FullDietRequestDTO draft = useCase.execute(10, "emagrecimento, sem lactose");

        assertNotNull(draft);
        assertEquals(1, draft.getRefeicoes().size());
        assertEquals(99, draft.getRefeicoes().get(0).getAlimentos().get(0).getFoodItemId());
    }

    @Test
    @DisplayName("execute - objetivo combinando com modelo salvo deve incluir few-shot no prompt")
    void execute_ComModeloRelevanteIncluiFewShotNoPrompt() {
        DietModel modelo = new DietModel();
        modelo.setNome("Dieta para Emagrecimento");
        modelo.setObservacao("Déficit calórico moderado");

        DietMealItemModel item = new DietMealItemModel();
        item.setDescricao("Aveia com banana");
        item.setQuantidade(new BigDecimal("50"));
        item.setUnidade("g");

        DietMealModel refeicao = new DietMealModel();
        refeicao.setNome("Café da manhã");
        refeicao.setHorario(LocalTime.of(8, 0));
        refeicao.setItens(List.of(item));

        modelo.setRefeicoes(List.of(refeicao));

        when(patientRepository.findById(10)).thenReturn(Optional.of(paciente));
        when(patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(10)).thenReturn(null);
        when(dietRepository.findAll()).thenReturn(List.of(modelo));
        when(groqAiService.generateDietSuggestion(anyString()))
                .thenReturn("{\"refeicoes\": [{\"descricao\": \"Café da manhã\", \"alimentos\": "
                        + "[{\"alimento\": \"Aveia\", \"quantidade\": 50, \"unidade\": \"g\"}]}]}");

        useCase.execute(10, "quero um plano de emagrecimento");

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        verify(groqAiService).generateDietSuggestion(promptCaptor.capture());
        String prompt = promptCaptor.getValue();

        assertTrue(prompt.contains("Dieta para Emagrecimento"), "prompt deveria citar o modelo salvo");
        assertTrue(prompt.contains("Aveia com banana"), "prompt deveria citar os itens do modelo salvo");
    }

    @Test
    @DisplayName("execute - sem modelo com palavras-chave em comum não deve incluir few-shot no prompt")
    void execute_SemModeloRelevanteNaoIncluiFewShot() {
        DietModel modeloNaoRelacionado = new DietModel();
        modeloNaoRelacionado.setNome("Hipertrofia Avançada");
        modeloNaoRelacionado.setObservacao("Foco em ganho de massa muscular");
        modeloNaoRelacionado.setRefeicoes(List.of());

        when(patientRepository.findById(10)).thenReturn(Optional.of(paciente));
        when(patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(10)).thenReturn(null);
        when(dietRepository.findAll()).thenReturn(List.of(modeloNaoRelacionado));
        when(groqAiService.generateDietSuggestion(anyString()))
                .thenReturn("{\"refeicoes\": [{\"descricao\": \"Café da manhã\", \"alimentos\": "
                        + "[{\"alimento\": \"Aveia\", \"quantidade\": 50, \"unidade\": \"g\"}]}]}");

        useCase.execute(10, "detox suave");

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        verify(groqAiService).generateDietSuggestion(promptCaptor.capture());
        String prompt = promptCaptor.getValue();

        assertFalse(prompt.contains("Exemplo de como esta nutricionista"),
                "prompt não deveria incluir few-shot sem um modelo relevante");
    }
}
