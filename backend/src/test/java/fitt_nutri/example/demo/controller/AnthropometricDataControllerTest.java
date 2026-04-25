package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.service.AnthropometricDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnthropometricDataControllerTest {

    @InjectMocks
    private AnthropometricDataController controller;

    @Mock
    private AnthropometricDataService service;

    private AnthropometricDataModel model;

    @BeforeEach
    void setUp() {

        model = new AnthropometricDataModel();

        model.setIdDadosAntropometricos(1);
        model.setAltura(1.75);
        model.setPeso(70.0);
        model.setImc(22.86);
        model.setPorcentagemGordura(15.0);
        model.setMassaMuscular(50.0);
        model.setTaxaMetabolicaBasal(1600.0);
        model.setIdadeMetabolica(25);
        model.setGorduraVisceral(5.0);
    }

    @Test
    @DisplayName("deve retornar status 200 quando listar todos os dados antropométricos com sucesso")
    void getAll() {

        when(service.listAll()).thenReturn(List.of(model));

        ResponseEntity<List<AnthropometricDataModel>> response = controller.getAll();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(model, response.getBody().get(0));
    }

    @Test
    @DisplayName("deve retornar status 200 quando buscar dado antropométrico por ID com sucesso")
    void getById() {

        when(service.getById(1)).thenReturn(model);
        ResponseEntity<AnthropometricDataModel> response = controller.getById(1);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().getIdDadosAntropometricos());
        assertEquals(model, response.getBody());
    }

    @Test
    @DisplayName("deve retornar status 201 quando criar dado antropométrico com sucesso")
    void create() {
        when(service.create(model)).thenReturn(model);
        ResponseEntity<AnthropometricDataModel> response = controller.create(model);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(model, response.getBody());
    }

    @Test
    @DisplayName("deve retornar status 200 quando atualizar dados antropométricos por ID com sucesso")
    void update() {
        Integer id = 1;

        when(service.update(model)).thenReturn(model);

        ResponseEntity<AnthropometricDataModel> response = controller.update(id, model);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(id, response.getBody().getIdDadosAntropometricos());
        assertEquals(model, response.getBody());
    }

    @Test
    @DisplayName("deve retornar status 200 quando realizar atualização parcial por ID com sucesso")
    void partialUpdate() {
        Integer id = 1;
        Map<String, Object> fields = new HashMap<>();
        fields.put("peso", 72.0);

        when(service.partialUpdate(id, fields)).thenReturn(model);

        ResponseEntity<AnthropometricDataModel> response = controller.partialUpdate(id, fields);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(model, response.getBody());
    }

    @Test
    @DisplayName("deve retornar status 204 quando deletar dados antropométricos por ID com sucesso")
    void delete() {
        Integer id = 1;

        ResponseEntity<Void> response = controller.delete(id);

        assertEquals(204, response.getStatusCodeValue());
        verify(service).deleteById(id);
    }

    @Test
    @DisplayName("deve retornar status 200 quando realizar atualização parcial por ID de paciente com sucesso")
    void partialUpdateByPaciente() {
        Integer pacienteId = 10;
        Map<String, Object> fields = new HashMap<>();
        fields.put("massaMuscular", 52.0);

        when(service.partialUpdateByPacienteId(pacienteId, fields)).thenReturn(model);

        ResponseEntity<?> response = controller.partialUpdateByPaciente(pacienteId, fields);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(model, response.getBody());
    }

    @Test
    @DisplayName("deve retornar status 200 quando buscar dados antropométricos por ID do paciente com sucesso")
    void getByPaciente() {
        Integer pacienteId = 10;
        List<AnthropometricDataModel> lista = List.of(model);

        when(service.findByPaciente_Id(pacienteId)).thenReturn(lista);

        ResponseEntity<?> response = controller.getByPaciente(pacienteId);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(lista, response.getBody());
    }
}
