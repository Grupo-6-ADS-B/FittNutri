package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.SchedulingModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.repository.SchedulingRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SchedulingServiceTest {

    @InjectMocks
    private SchedulingService service;

    @Mock
    private SchedulingRepository repository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    private PatientModel patient;
    private UserModel nutritionist;
    private SchedulingModel scheduling;
    private LocalDate data;

    @BeforeEach
    void setUp() {
        patient = new PatientModel();
        patient.setId(1);

        nutritionist = new UserModel();
        nutritionist.setId(2);

        data = LocalDate.of(2025, 1, 10);

        scheduling = new SchedulingModel();
        scheduling.setId(100);
        scheduling.setPaciente(patient);
        scheduling.setNutricionista(nutritionist);
        scheduling.setDataAgendada(data);
        scheduling.setObservacoes("Obs inicial");
    }

    // ---------- createScheduling ----------

    @Test
    @DisplayName("createScheduling - deve criar agendamento quando paciente e nutricionista existem")
    void createScheduling_DeveCriarQuandoPacienteENutriExistem() {
        SchedulingRequestDTO dto =
                new SchedulingRequestDTO(patient.getId(), nutritionist.getId(), data, "Consulta");

        when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
        when(userRepository.findById(nutritionist.getId())).thenReturn(Optional.of(nutritionist));
        when(repository.save(any(SchedulingModel.class))).thenReturn(scheduling);

        SchedulingModel result = service.createScheduling(dto);

        assertNotNull(result);
        assertEquals(scheduling, result);
        verify(patientRepository).findById(patient.getId());
        verify(userRepository).findById(nutritionist.getId());
        verify(repository).save(any(SchedulingModel.class));
    }

    @Test
    @DisplayName("createScheduling - deve lançar NotFoundException quando paciente não existe")
    void createScheduling_DeveLancarExcecaoQuandoPacienteNaoExiste() {
        SchedulingRequestDTO dto =
                new SchedulingRequestDTO(999, nutritionist.getId(), data, "Consulta");

        when(patientRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.createScheduling(dto));
        verify(patientRepository).findById(999);
        verifyNoInteractions(userRepository);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("createScheduling - deve lançar NotFoundException quando nutricionista não existe")
    void createScheduling_DeveLancarExcecaoQuandoNutricionistaNaoExiste() {
        SchedulingRequestDTO dto =
                new SchedulingRequestDTO(patient.getId(), 999, data, "Consulta");

        when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.createScheduling(dto));
        verify(patientRepository).findById(patient.getId());
        verify(userRepository).findById(999);
        verify(repository, never()).save(any());
    }

    // ---------- getAllSchedulings ----------

    @Test
    @DisplayName("getAllSchedulings - deve retornar lista de agendamentos")
    void getAllSchedulings_DeveRetornarLista() {
        when(repository.findAll()).thenReturn(List.of(scheduling));

        List<SchedulingModel> result = service.getAllSchedulings();

        assertEquals(1, result.size());
        assertEquals(scheduling, result.get(0));
        verify(repository).findAll();
    }

    // ---------- getSchedulingById ----------

    @Test
    @DisplayName("getSchedulingById - deve retornar agendamento quando encontrado")
    void getSchedulingById_DeveRetornarQuandoEncontrado() {
        when(repository.findById(100)).thenReturn(Optional.of(scheduling));

        SchedulingModel result = service.getSchedulingById(100);

        assertEquals(scheduling, result);
        verify(repository).findById(100);
    }

    @Test
    @DisplayName("getSchedulingById - deve lançar NotFoundException quando não encontrado")
    void getSchedulingById_DeveLancarExcecaoQuandoNaoEncontrado() {
        when(repository.findById(100)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getSchedulingById(100));
        verify(repository).findById(100);
    }

    // ---------- getByPatient ----------

    @Test
    @DisplayName("getByPatient - deve retornar lista quando paciente existe")
    void getByPatient_DeveRetornarListaQuandoPacienteExiste() {
        when(patientRepository.existsById(patient.getId())).thenReturn(true);
        when(repository.findByPacienteId(patient.getId())).thenReturn(List.of(scheduling));

        List<SchedulingModel> result = service.getByPatient(patient.getId());

        assertEquals(1, result.size());
        assertEquals(scheduling, result.get(0));
        verify(patientRepository).existsById(patient.getId());
        verify(repository).findByPacienteId(patient.getId());
    }

    @Test
    @DisplayName("getByPatient - deve lançar NotFoundException quando paciente não existe")
    void getByPatient_DeveLancarExcecaoQuandoPacienteNaoExiste() {
        when(patientRepository.existsById(999)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> service.getByPatient(999));
        verify(patientRepository).existsById(999);
        verify(repository, never()).findByPacienteId(any());
    }

    // ---------- getByNutritionist ----------

    @Test
    @DisplayName("getByNutritionist - deve retornar lista quando nutricionista existe")
    void getByNutritionist_DeveRetornarListaQuandoNutriExiste() {
        when(userRepository.existsById(nutritionist.getId())).thenReturn(true);
        when(repository.findByNutricionistaId(nutritionist.getId()))
                .thenReturn(List.of(scheduling));

        List<SchedulingModel> result = service.getByNutritionist(nutritionist.getId());

        assertEquals(1, result.size());
        assertEquals(scheduling, result.get(0));
        verify(userRepository).existsById(nutritionist.getId());
        verify(repository).findByNutricionistaId(nutritionist.getId());
    }

    @Test
    @DisplayName("getByNutritionist - deve lançar NotFoundException quando nutricionista não existe")
    void getByNutritionist_DeveLancarExcecaoQuandoNutriNaoExiste() {
        when(userRepository.existsById(999)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> service.getByNutritionist(999));
        verify(userRepository).existsById(999);
        verify(repository, never()).findByNutricionistaId(any());
    }

    // ---------- updateScheduling ----------

    @Test
    @DisplayName("updateScheduling - deve atualizar campos informados e salvar")
    void updateScheduling_DeveAtualizarCampos() {
        SchedulingRequestDTO dto =
                new SchedulingRequestDTO(null, null, data.plusDays(1), "Nova obs");

        when(repository.findById(100)).thenReturn(Optional.of(scheduling));
        when(repository.save(any(SchedulingModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SchedulingModel result = service.updateScheduling(100, dto);

        assertEquals(data.plusDays(1), result.getDataAgendada());
        assertEquals("Nova obs", result.getObservacoes());
        verify(repository).findById(100);
        verify(repository).save(any(SchedulingModel.class));
    }

    @Test
    @DisplayName("updateScheduling - deve lançar NotFoundException quando agendamento não existe")
    void updateScheduling_DeveLancarExcecaoQuandoNaoExiste() {
        SchedulingRequestDTO dto =
                new SchedulingRequestDTO(null, null, data.plusDays(1), "Nova obs");

        when(repository.findById(100)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.updateScheduling(100, dto));
        verify(repository).findById(100);
        verify(repository, never()).save(any());
    }

    // ---------- deleteScheduling ----------

    @Test
    @DisplayName("deleteScheduling - deve deletar quando existir")
    void deleteScheduling_DeveDeletarQuandoExiste() {
        when(repository.existsById(100)).thenReturn(true);

        service.deleteScheduling(100);

        verify(repository).existsById(100);
        verify(repository).deleteById(100);
    }

    @Test
    @DisplayName("deleteScheduling - deve lançar NotFoundException quando agendamento não existe")
    void deleteScheduling_DeveLancarExcecaoQuandoNaoExiste() {
        when(repository.existsById(100)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> service.deleteScheduling(100));
        verify(repository).existsById(100);
        verify(repository, never()).deleteById(any());
    }

    // ---------- updateDate ----------

    @Test
    @DisplayName("updateDate - deve atualizar data e salvar")
    void updateDate_DeveAtualizarData() {
        LocalDate novaData = data.plusDays(3);
        when(repository.findById(100)).thenReturn(Optional.of(scheduling));
        when(repository.save(any(SchedulingModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SchedulingModel result = service.updateDate(100, novaData);

        assertEquals(novaData, result.getDataAgendada());
        verify(repository).findById(100);
        verify(repository).save(any(SchedulingModel.class));
    }

    // ---------- updateObservacoes ----------

    @Test
    @DisplayName("updateObservacoes - deve atualizar observações e salvar")
    void updateObservacoes_DeveAtualizarObservacoes() {
        String novasObs = "Observações atualizadas";
        when(repository.findById(100)).thenReturn(Optional.of(scheduling));
        when(repository.save(any(SchedulingModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SchedulingModel result = service.updateObservacoes(100, novasObs);

        assertEquals(novasObs, result.getObservacoes());
        verify(repository).findById(100);
        verify(repository).save(any(SchedulingModel.class));
    }

    // ---------- countByPatient ----------

    @Test
    @DisplayName("countByPatient - deve retornar quantidade quando paciente existe")
    void countByPatient_DeveRetornarQuantidadeQuandoPacienteExiste() {
        when(patientRepository.existsById(patient.getId())).thenReturn(true);
        when(repository.findByPacienteId(patient.getId()))
                .thenReturn(List.of(scheduling, scheduling));

        Long count = service.countByPatient(patient.getId());

        assertEquals(2L, count);
        verify(patientRepository).existsById(patient.getId());
        verify(repository).findByPacienteId(patient.getId());
    }

    @Test
    @DisplayName("countByPatient - deve lançar NotFoundException quando paciente não existe")
    void countByPatient_DeveLancarExcecaoQuandoPacienteNaoExiste() {
        when(patientRepository.existsById(999)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> service.countByPatient(999));
        verify(patientRepository).existsById(999);
        verify(repository, never()).findByPacienteId(any());
    }

    // ---------- countByDate ----------

    @Test
    @DisplayName("countByDate - deve contar agendamentos na data informada")
    void countByDate_DeveContarCorretamente() {
        SchedulingModel outro = new SchedulingModel();
        outro.setDataAgendada(data.plusDays(1));

        when(repository.findAll()).thenReturn(List.of(scheduling, outro, scheduling));

        Long count = service.countByDate(data);

        // temos 2 agendamentos com 'data' e 1 com outra data
        assertEquals(2L, count);
        verify(repository).findAll();
    }
}
