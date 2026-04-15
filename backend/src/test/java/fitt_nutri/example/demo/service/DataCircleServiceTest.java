package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
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

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataCircleServiceTest {

    @InjectMocks
    private DataCircleService service;

    @Mock
    private DataCircleRepository repository;

    @Mock
    private PatientRepository patientRepository;

    private DataCircleModel existing;   // registro já existente (para update / patch / get)
    private PatientModel paciente;

    @BeforeEach
    void setUp() {
        // Nutricionista logado
        UserModel nutricionista = new UserModel();
        nutricionista.setEmail("nutri@test.com");

        // Paciente "padrão" com ID e nutricionista (necessário para verificarPropriedadePaciente)
        paciente = new PatientModel();
        paciente.setId(10);
        paciente.setNutricionista(nutricionista);

        // Simula autenticação no SecurityContext
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("nutri@test.com", null, List.of())
        );

        // Registro existente no "banco"
        existing = new DataCircleModel();
        existing.setIdDadosCircunferencia(1);
        existing.setAbdominal(90.0);
        existing.setCintura(80.0);
        existing.setQuadril(100.0);
        existing.setPulso(16.0);
        existing.setPanturrilha(37.0);
        existing.setBraco(32.0);
        existing.setCoxa(55.0);
        existing.setPesoIdeal(75.0);
        existing.setPaciente(paciente);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ---------- CREATE ----------

    @Test
    @DisplayName("cadastrar - deve salvar e retornar o registro quando os dados forem válidos")
    void cadastrar_DeveSalvarERetornar() {
        DataCircleModel novo = new DataCircleModel();
        novo.setIdDadosCircunferencia(null); // ID deve ser nulo ao cadastrar
        novo.setAbdominal(90.0);
        novo.setCintura(80.0);
        novo.setQuadril(100.0);
        novo.setPulso(16.0);
        novo.setPanturrilha(37.0);
        novo.setBraco(32.0);
        novo.setCoxa(55.0);
        novo.setPesoIdeal(75.0);
        novo.setPaciente(paciente);

        // Service agora busca o paciente real no banco
        when(patientRepository.findById(paciente.getId())).thenReturn(Optional.of(paciente));
        when(repository.save(novo)).thenReturn(novo);

        DataCircleModel result = service.cadastrar(novo);

        assertEquals(novo, result);
        verify(patientRepository).findById(paciente.getId());
        verify(repository).save(novo);
        verify(repository).flush();
    }

    // ---------- READ ALL ----------

    @Test
    @DisplayName("pegarTodos - deve retornar lista de registros")
    void pegarTodos_DeveRetornarLista() {
        when(repository.findAll()).thenReturn(List.of(existing));

        List<DataCircleModel> result = service.pegarTodos();

        assertEquals(1, result.size());
        assertEquals(existing, result.get(0));
        verify(repository).findAll();
    }

    // ---------- GET BY ID ----------

    @Test
    @DisplayName("pegarPorId - deve retornar registro quando ID existir")
    void pegarPorId_DeveRetornarQuandoExistir() {
        when(repository.findById(1)).thenReturn(Optional.of(existing));

        DataCircleModel result = service.pegarPorId(1);

        assertEquals(existing, result);
        verify(repository).findById(1);
    }

    // ---------- UPDATE (PUT) ----------

    @Test
    @DisplayName("atualizar - deve atualizar e retornar o registro")
    void atualizar_DeveAtualizarERetornar() {
        Integer id = 1;

        DataCircleModel body = new DataCircleModel();
        body.setAbdominal(91.0);
        body.setCintura(81.0);
        body.setQuadril(101.0);
        body.setPulso(17.0);
        body.setPanturrilha(38.0);
        body.setBraco(33.0);
        body.setCoxa(56.0);
        body.setPesoIdeal(76.0);
        body.setPaciente(paciente);

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(body)).thenReturn(body);

        DataCircleModel result = service.atualizar(id, body);

        assertEquals(body, result);
        assertEquals(id, result.getIdDadosCircunferencia());
        verify(repository).findById(id);
        verify(repository).save(body);
        verify(repository).flush();
    }

    // ---------- PARTIAL UPDATE (PATCH) ----------

    @Test
    @DisplayName("atualizarParcial - deve atualizar parcialmente e retornar registro")
    void atualizarParcial_DeveAtualizarParcialmente() {
        Integer id = 1;
        Map<String, Object> updates = new HashMap<>();
        updates.put("cintura", 82.0);

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(any(DataCircleModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DataCircleModel result = service.atualizarParcial(id, updates);

        assertEquals(82.0, result.getCintura());
        verify(repository).findById(id);
        verify(repository).save(result);
        verify(repository).flush();
    }

    // ---------- DELETE ----------

    @Test
    @DisplayName("deletar - deve deletar quando ID existir")
    void deletar_DeveDeletarQuandoExiste() {
        Integer id = 1;

        when(repository.existsById(id)).thenReturn(true);
        doNothing().when(repository).deleteById(id);

        service.deletar(id);

        verify(repository).existsById(id);
        verify(repository).deleteById(id);
    }

    // ---------- COUNT ----------

    @Test
    @DisplayName("contarRegistros - deve retornar quantidade de registros")
    void contarRegistros_DeveRetornarQuantidade() {
        when(repository.count()).thenReturn(10L);

        long result = service.contarRegistros();

        assertEquals(10L, result);
        verify(repository).count();
    }

    // ---------- LIST BY PATIENT ----------

    @Test
    @DisplayName("listarPorPaciente - deve retornar lista de registros do paciente")
    void listarPorPaciente_DeveRetornarLista() {
        Integer pacienteId = paciente.getId();
        List<DataCircleModel> lista = List.of(existing);

        when(repository.findByPaciente_Id(pacienteId)).thenReturn(lista);

        List<DataCircleModel> result = service.listarPorPaciente(pacienteId);

        assertEquals(lista, result);
        verify(repository).findByPaciente_Id(pacienteId);
    }
}
