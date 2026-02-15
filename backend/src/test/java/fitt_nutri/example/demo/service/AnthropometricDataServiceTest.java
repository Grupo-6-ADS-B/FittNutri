package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.AlreadyExistingData;
import fitt_nutri.example.demo.exceptions.NotFoundData;
import fitt_nutri.example.demo.exceptions.NotFoundUser;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.repository.AnthropometricDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnthropometricDataServiceTest {

    @InjectMocks
    private AnthropometricDataService service;

    @Mock
    private AnthropometricDataRepository repository;

    private AnthropometricDataModel model;

    @BeforeEach
    void setUp() {
        model = new AnthropometricDataModel();
        model.setIdDadosAntropometricos(1);
        model.setAltura(1.75);
        model.setPeso(70.0);
        model.setImc(22.86);
        model.setPercentualGordura(15.0);
        model.setMassaMuscular(50.0);
        model.setTmb(1600);
        model.setIdadeMetabolica(25);
        model.setGorduraVisceral(5);
    }

    // ---------- listAll ----------

    @Test
    @DisplayName("listAll - deve retornar lista quando houver dados")
    void listAll_DeveRetornarListaQuandoNaoVazia() {
        when(repository.findAll()).thenReturn(List.of(model));

        List<AnthropometricDataModel> result = service.listAll();

        assertEquals(1, result.size());
        assertEquals(model, result.get(0));
        verify(repository, times(2)).findAll(); // é chamado 2x no service
    }

    @Test
    @DisplayName("listAll - deve lançar NotFoundUser quando lista estiver vazia")
    void listAll_DeveLancarNotFoundUserQuandoListaVazia() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        assertThrows(NotFoundUser.class, () -> service.listAll());
        verify(repository, times(1)).findAll();
    }

    // ---------- getById ----------

    @Test
    @DisplayName("getById - deve retornar dado quando ID existir")
    void getById_DeveRetornarQuandoExistir() {
        when(repository.findById(1)).thenReturn(Optional.of(model));

        AnthropometricDataModel result = service.getById(1);

        assertEquals(model, result);
        verify(repository).findById(1);
    }

    @Test
    @DisplayName("getById - deve lançar NotFoundUser quando ID não existir")
    void getById_DeveLancarNotFoundUserQuandoNaoExistir() {
        when(repository.findById(1)).thenReturn(Optional.empty());

        assertThrows(NotFoundUser.class, () -> service.getById(1));
        verify(repository).findById(1);
    }

    // ---------- create ----------

    @Test
    @DisplayName("create - deve salvar dado válido com ID nulo")
    void create_DeveSalvarQuandoDadosValidosEIdNulo() {
        AnthropometricDataModel novo = new AnthropometricDataModel();
        novo.setIdDadosAntropometricos(null); // ID nulo → não entra no existsById
        novo.setAltura(1.80);
        novo.setPeso(80.0);
        novo.setTmb(1800);
        novo.setPercentualGordura(20.0);
        novo.setGorduraVisceral(10);

        when(repository.save(novo)).thenReturn(novo);

        AnthropometricDataModel result = service.create(novo);

        assertEquals(novo, result);
        verify(repository).save(novo);
        verify(repository, never()).existsById(any());
    }

    @Test
    @DisplayName("create - deve lançar AlreadyExistingData quando ID já existir")
    void create_DeveLancarAlreadyExistingDataQuandoIdJaExistir() {
        AnthropometricDataModel novo = new AnthropometricDataModel();
        novo.setIdDadosAntropometricos(1);
        novo.setAltura(1.80);
        novo.setPeso(80.0);
        novo.setTmb(1800);
        novo.setPercentualGordura(20.0);
        novo.setGorduraVisceral(10);

        when(repository.existsById(1)).thenReturn(true);

        assertThrows(AlreadyExistingData.class, () -> service.create(novo));
        verify(repository).existsById(1);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("create - deve lançar NotFoundData quando altura for inválida")
    void create_DeveLancarNotFoundDataQuandoAlturaInvalida() {
        AnthropometricDataModel novo = new AnthropometricDataModel();
        novo.setIdDadosAntropometricos(null);
        novo.setAltura(3.0); // inválida
        novo.setPeso(80.0);
        novo.setTmb(1800);
        novo.setPercentualGordura(20.0);
        novo.setGorduraVisceral(10);

        assertThrows(NotFoundData.class, () -> service.create(novo));
        verify(repository, never()).save(any());
    }

    // ---------- deleteById ----------

    @Test
    @DisplayName("deleteById - deve deletar quando ID existir")
    void deleteById_DeveDeletarQuandoIdExistir() {
        when(repository.existsById(1)).thenReturn(true);

        service.deleteById(1);

        verify(repository).existsById(1);
        verify(repository).deleteById(1);
    }

    @Test
    @DisplayName("deleteById - deve lançar NotFoundUser quando ID não existir")
    void deleteById_DeveLancarNotFoundUserQuandoIdNaoExistir() {
        when(repository.existsById(1)).thenReturn(false);

        assertThrows(NotFoundUser.class, () -> service.deleteById(1));
        verify(repository).existsById(1);
        verify(repository, never()).deleteById(any());
    }

    // ---------- update ----------

    @Test
    @DisplayName("update - deve salvar e retornar dado atualizado")
    void update_DeveSalvarEretornar() {
        when(repository.save(model)).thenReturn(model);

        AnthropometricDataModel result = service.update(model);

        assertEquals(model, result);
        verify(repository).save(model);
    }

    // ---------- partialUpdate ----------

    @Test
    @DisplayName("partialUpdate - deve atualizar parcialmente campos válidos")
    void partialUpdate_DeveAtualizarParcialmente() {
        Integer id = 1;
        Map<String, Object> fields = new HashMap<>();
        fields.put("peso", 75.0);

        when(repository.findById(id)).thenReturn(Optional.of(model));
        when(repository.save(any(AnthropometricDataModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AnthropometricDataModel result = service.partialUpdate(id, fields);

        assertEquals(75.0, result.getPeso());
        verify(repository).findById(id);
        verify(repository).save(result);
    }

    @Test
    @DisplayName("partialUpdate - deve lançar NotFoundData quando ID não existir")
    void partialUpdate_DeveLancarNotFoundDataQuandoIdNaoExistir() {
        Integer id = 1;
        Map<String, Object> fields = Map.of("peso", 75.0);

        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundData.class, () -> service.partialUpdate(id, fields));
        verify(repository).findById(id);
        verify(repository, never()).save(any());
    }

    // ---------- findByPaciente_Id ----------

    @Test
    @DisplayName("findByPaciente_Id - deve retornar lista quando houver dados")
    void findByPacienteId_DeveRetornarLista() {
        Integer pacienteId = 10;
        List<AnthropometricDataModel> lista = List.of(model);

        when(repository.findByPaciente_Id(pacienteId)).thenReturn(lista);

        List<AnthropometricDataModel> result = service.findByPaciente_Id(pacienteId);

        assertEquals(lista, result);
        verify(repository).findByPaciente_Id(pacienteId);
    }

    @Test
    @DisplayName("findByPaciente_Id - deve lançar NotFoundData quando lista estiver vazia")
    void findByPacienteId_DeveLancarNotFoundDataQuandoVazia() {
        Integer pacienteId = 10;

        when(repository.findByPaciente_Id(pacienteId)).thenReturn(Collections.emptyList());

        assertThrows(NotFoundData.class, () -> service.findByPaciente_Id(pacienteId));
        verify(repository).findByPaciente_Id(pacienteId);
    }

    // ---------- partialUpdateByPacienteId ----------

    @Test
    @DisplayName("partialUpdateByPacienteId - deve atualizar parcialmente por pacienteId")
    void partialUpdateByPacienteId_DeveAtualizarParcialmente() {
        Integer pacienteId = 10;
        Map<String, Object> fields = new HashMap<>();
        fields.put("massaMuscular", 55.0);

        when(repository.findFirstByPaciente_Id(pacienteId)).thenReturn(model);
        when(repository.save(any(AnthropometricDataModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AnthropometricDataModel result = service.partialUpdateByPacienteId(pacienteId, fields);

        assertEquals(55.0, result.getMassaMuscular());
        verify(repository).findFirstByPaciente_Id(pacienteId);
        verify(repository).save(result);
    }

    @Test
    @DisplayName("partialUpdateByPacienteId - deve lançar NotFoundData quando não encontrar dados do paciente")
    void partialUpdateByPacienteId_DeveLancarNotFoundDataQuandoNaoEncontrar() {
        Integer pacienteId = 10;
        Map<String, Object> fields = Map.of("massaMuscular", 55.0);

        when(repository.findFirstByPaciente_Id(pacienteId)).thenReturn(null);

        assertThrows(NotFoundData.class, () -> service.partialUpdateByPacienteId(pacienteId, fields));
        verify(repository).findFirstByPaciente_Id(pacienteId);
        verify(repository, never()).save(any());
    }
}
