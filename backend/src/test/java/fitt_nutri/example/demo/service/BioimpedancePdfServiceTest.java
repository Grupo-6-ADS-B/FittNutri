package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.PatientHistoryModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BioimpedancePdfServiceTest {

    @InjectMocks
    private BioimpedancePdfService service;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientHistoryRepository historyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GroqAiService groqAiService;

    private PatientModel paciente;
    private UserModel nutricionista;

    @BeforeEach
    void setUp() {
        nutricionista = new UserModel();
        nutricionista.setId(1);
        nutricionista.setEmail("nutri@test.com");
        nutricionista.setNome("Nutri Teste");
        nutricionista.setCrn("12345/SP");

        paciente = new PatientModel();
        paciente.setId(10);
        paciente.setNome("Paciente Teste");
        paciente.setSexo("Feminino");
        paciente.setNutricionista(nutricionista);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("nutri@test.com", null, List.of())
        );

        when(userRepository.findByEmail("nutri@test.com")).thenReturn(Optional.of(nutricionista));
        when(patientRepository.findById(10)).thenReturn(Optional.of(paciente));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private AnthropometricDataModel dados(double peso, double imc) {
        AnthropometricDataModel a = new AnthropometricDataModel();
        a.setPeso(peso);
        a.setImc(imc);
        a.setPorcentagemGordura(28.0);
        a.setMassaMuscular(30.0);
        a.setGorduraVisceral(8.0);
        a.setIdadeMetabolica(30);
        a.setIdade(28);
        return a;
    }

    private PatientHistoryModel historico(LocalDate data, AnthropometricDataModel dados) {
        PatientHistoryModel h = new PatientHistoryModel();
        h.setDataConsulta(data);
        h.setAnthropometricDataModel(dados);
        return h;
    }

    @Test
    @DisplayName("generateBioimpedancePdf - primeira consulta não deve chamar a IA")
    void generateBioimpedancePdf_PrimeiraConsulta_NaoChamaIA() throws Exception {
        PatientHistoryModel unico = historico(LocalDate.of(2026, 1, 10), dados(70.0, 25.0));
        when(historyRepository.findByPatientModelIdOrderByDataConsultaAsc(10)).thenReturn(List.of(unico));

        byte[] pdf = service.generateBioimpedancePdf(10);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
        verifyNoInteractions(groqAiService);
    }

    @Test
    @DisplayName("generateBioimpedancePdf - com histórico anterior, chama a IA para o resumo de evolução")
    void generateBioimpedancePdf_ComHistorico_ChamaIA() throws Exception {
        PatientHistoryModel anterior = historico(LocalDate.of(2026, 1, 10), dados(75.0, 27.0));
        PatientHistoryModel atual = historico(LocalDate.of(2026, 2, 10), dados(70.0, 25.0));
        when(historyRepository.findByPatientModelIdOrderByDataConsultaAsc(10))
                .thenReturn(List.of(anterior, atual));
        when(groqAiService.generateText(anyString(), anyString()))
                .thenReturn("O paciente reduziu o peso e o IMC desde a última consulta, mantendo a gordura visceral estável.");

        byte[] pdf = service.generateBioimpedancePdf(10);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
        verify(groqAiService).generateText(anyString(), anyString());
    }

    @Test
    @DisplayName("generateBioimpedancePdf - se a IA falhar (retornar null), o PDF ainda é gerado")
    void generateBioimpedancePdf_FalhaDaIA_NaoQuebraPdf() throws Exception {
        PatientHistoryModel anterior = historico(LocalDate.of(2026, 1, 10), dados(75.0, 27.0));
        PatientHistoryModel atual = historico(LocalDate.of(2026, 2, 10), dados(70.0, 25.0));
        when(historyRepository.findByPatientModelIdOrderByDataConsultaAsc(10))
                .thenReturn(List.of(anterior, atual));
        when(groqAiService.generateText(anyString(), anyString())).thenReturn(null);

        byte[] pdf = assertDoesNotThrow(() -> service.generateBioimpedancePdf(10));

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }
}
