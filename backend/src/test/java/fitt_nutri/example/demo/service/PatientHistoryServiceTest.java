package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.ConsultaPacienteRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientHistoryResponseDTO;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.model.PatientHistoryModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.AnthropometricDataRepository;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientHistoryServiceTest {

    @InjectMocks
    private PatientHistoryService service;

    @Mock
    private PatientHistoryRepository repository;

    @Mock
    private PatientRepository pacienteRepository;

    @Mock
    private AnthropometricDataRepository dadosAntropometricosRepository;

    @Mock
    private DataCircleRepository dadosCircunferenciaRepository;

    private PatientModel paciente;

    @BeforeEach
    void setUp() {
        UserModel nutricionista = new UserModel();
        nutricionista.setEmail("nutri@test.com");

        paciente = new PatientModel();
        paciente.setId(10);
        paciente.setNutricionista(nutricionista);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("nutri@test.com", null, List.of())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private ConsultaPacienteRequestDTO dtoCompleto(LocalDate data) {
        ConsultaPacienteRequestDTO dto = new ConsultaPacienteRequestDTO();
        dto.setPacienteId(10);
        dto.setDataConsulta(data);
        dto.setMotivoConsulta("Emagrecimento");

        AnthropometricDataModel antro = new AnthropometricDataModel();
        antro.setPeso(70.0);
        antro.setAltura(1.65);
        dto.setAntropometria(antro);

        DataCircleModel circ = new DataCircleModel();
        circ.setCintura(74.0);
        dto.setCircunferencia(circ);

        return dto;
    }

    @Test
    @DisplayName("salvarConsulta - sem dados antropométricos deve lançar InvalidDataException")
    void salvarConsulta_SemAntropometria_LancaExcecao() {
        when(pacienteRepository.findById(10)).thenReturn(Optional.of(paciente));

        ConsultaPacienteRequestDTO dto = dtoCompleto(LocalDate.of(2026, 8, 29));
        dto.setAntropometria(null);

        assertThrows(InvalidDataException.class, () -> service.salvarConsulta(10, dto));
        verifyNoInteractions(dadosAntropometricosRepository, dadosCircunferenciaRepository, repository);
    }

    @Test
    @DisplayName("salvarConsulta - sem dados de circunferência deve lançar InvalidDataException (não NPE)")
    void salvarConsulta_SemCircunferencia_LancaExcecao() {
        when(pacienteRepository.findById(10)).thenReturn(Optional.of(paciente));

        ConsultaPacienteRequestDTO dto = dtoCompleto(LocalDate.of(2026, 8, 29));
        dto.setCircunferencia(null);

        assertThrows(InvalidDataException.class, () -> service.salvarConsulta(10, dto));
        verifyNoInteractions(dadosCircunferenciaRepository, repository);
    }

    @Test
    @DisplayName("salvarConsulta - dados completos: persiste a dataConsulta exatamente como recebida, sem nenhum ajuste de dia")
    void salvarConsulta_DadosCompletos_PersisteDataSemAjuste() {
        when(pacienteRepository.findById(10)).thenReturn(Optional.of(paciente));
        when(dadosAntropometricosRepository.save(any(AnthropometricDataModel.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(dadosCircunferenciaRepository.save(any(DataCircleModel.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LocalDate dataEnviada = LocalDate.of(2026, 8, 29);
        ConsultaPacienteRequestDTO dto = dtoCompleto(dataEnviada);

        service.salvarConsulta(10, dto);

        ArgumentCaptor<PatientHistoryModel> captor = ArgumentCaptor.forClass(PatientHistoryModel.class);
        verify(repository).save(captor.capture());

        assertEquals(dataEnviada, captor.getValue().getDataConsulta(),
                "a data persistida deve ser idêntica à enviada — nenhum +1/-1 dia deve ser aplicado");
    }

    @Test
    @DisplayName("listarPorPaciente - mapeia PatientHistoryModel para DTO sem expor patientModel/nutricionista (evita ciclo e vazamento de senha)")
    void listarPorPaciente_MapeiaParaDtoSemCicloENuncaExpoeSenha() {
        when(pacienteRepository.findById(10)).thenReturn(Optional.of(paciente));

        AnthropometricDataModel antro = new AnthropometricDataModel();
        antro.setIdDadosAntropometricos(1);
        antro.setPeso(70.0);
        antro.setImc(24.5);

        DataCircleModel circ = new DataCircleModel();
        circ.setIdDadosCircunferencia(2);
        circ.setCintura(74.0);

        PatientHistoryModel historico = new PatientHistoryModel();
        historico.setId(99L);
        historico.setPatientModel(paciente); // referência que causava o ciclo — não deve ir para o DTO
        historico.setAnthropometricDataModel(antro);
        historico.setDataCircleModel(circ);
        historico.setDataConsulta(LocalDate.of(2026, 8, 29));
        historico.setMotivoConsulta("Emagrecimento");

        when(repository.findByPatientModelIdOrderByDataConsultaAsc(10)).thenReturn(List.of(historico));

        List<PatientHistoryResponseDTO> resultado = service.listarPorPaciente(10);

        assertEquals(1, resultado.size());
        PatientHistoryResponseDTO dto = resultado.get(0);
        assertEquals(99L, dto.id());
        assertEquals(LocalDate.of(2026, 8, 29), dto.dataConsulta());
        assertEquals("Emagrecimento", dto.motivoConsulta());
        assertEquals(70.0, dto.anthropometricDataModel().peso());
        assertEquals(74.0, dto.dataCircleModel().cintura());
        // o DTO não tem nenhum campo capaz de referenciar de volta PatientModel/UserModel —
        // a própria compilação já garante isso, mas o teste documenta a intenção.
    }

    @Test
    @DisplayName("listarPorPaciente - dados antropométricos/circunferência ausentes não quebram o mapeamento")
    void listarPorPaciente_SemDadosOpcionais_NaoQuebra() {
        when(pacienteRepository.findById(10)).thenReturn(Optional.of(paciente));

        PatientHistoryModel historico = new PatientHistoryModel();
        historico.setId(100L);
        historico.setPatientModel(paciente);
        historico.setDataConsulta(LocalDate.of(2026, 8, 29));

        when(repository.findByPatientModelIdOrderByDataConsultaAsc(10)).thenReturn(List.of(historico));

        List<PatientHistoryResponseDTO> resultado = service.listarPorPaciente(10);

        assertEquals(1, resultado.size());
        assertNull(resultado.get(0).anthropometricDataModel());
        assertNull(resultado.get(0).dataCircleModel());
    }
}
