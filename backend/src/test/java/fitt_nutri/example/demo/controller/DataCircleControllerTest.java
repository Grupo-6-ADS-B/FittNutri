package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.service.DataCircleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataCircleControllerTest {

    @InjectMocks
    private DataCircleController controller;

    @Mock
    private DataCircleService service;

    private DataCircleModel model;

    @BeforeEach
    void setUp() {
        // Necessário para o ServletUriComponentsBuilder funcionar no método cadastrar()
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        model = new DataCircleModel();
        model.setIdDadosCircunferencia(1);
        // se precisar, você pode setar outros campos do model aqui
    }

    @Test
    @DisplayName("deve retornar status 201 quando cadastrar dados de circunferência com sucesso")
    void cadastrar() {
        when(service.cadastrar(model)).thenReturn(model);

        ResponseEntity<DataCircleModel> response = controller.cadastrar(model);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(model, response.getBody());
        assertNotNull(response.getHeaders().getLocation());
        assertTrue(response.getHeaders().getLocation().toString().endsWith("/1"));
    }

    @Test
    @DisplayName("deve retornar status 200 quando recuperar todos os dados de circunferência com sucesso")
    void pegarTodos() {
        when(service.pegarTodos()).thenReturn(List.of(model));

        ResponseEntity<List<DataCircleModel>> response = controller.pegarTodos();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(model, response.getBody().get(0));
    }

    @Test
    @DisplayName("deve retornar status 200 quando recuperar dado de circunferência por ID com sucesso")
    void pegarPorId() {
        Integer id = 1;
        when(service.pegarPorId(id)).thenReturn(model);

        ResponseEntity<DataCircleModel> response = controller.pegarPorId(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(model, response.getBody());
        verify(service).pegarPorId(id);
    }

    @Test
    @DisplayName("deve retornar status 200 quando atualizar dado de circunferência por ID com sucesso")
    void atualizar() {
        Integer id = 1;
        when(service.atualizar(id, model)).thenReturn(model);

        ResponseEntity<DataCircleModel> response = controller.atualizar(id, model);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(model, response.getBody());
        verify(service).atualizar(id, model);
    }

    @Test
    @DisplayName("deve retornar status 200 quando atualizar parcialmente dado de circunferência por ID com sucesso")
    void atualizarParcial() {
        Integer id = 1;
        Map<String, Object> updates = new HashMap<>();
        updates.put("cintura", 80.0);

        when(service.atualizarParcial(id, updates)).thenReturn(model);

        ResponseEntity<DataCircleModel> response = controller.atualizarParcial(id, updates);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(model, response.getBody());
        verify(service).atualizarParcial(id, updates);
    }

    @Test
    @DisplayName("deve retornar status 204 quando deletar dado de circunferência por ID com sucesso")
    void deletar() {
        Integer id = 1;

        ResponseEntity<Void> response = controller.deletar(id);

        assertEquals(204, response.getStatusCodeValue());
        verify(service).deletar(id);
    }

    @Test
    @DisplayName("deve retornar status 200 quando contar registros com sucesso")
    void contarRegistros() {
        when(service.contarRegistros()).thenReturn(5L);

        ResponseEntity<Long> response = controller.contarRegistros();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(5L, response.getBody());
        verify(service).contarRegistros();
    }

    @Test
    @DisplayName("deve retornar status 200 quando listar dados de circunferência por paciente com sucesso")
    void getByPatient() {
        Integer pacienteId = 10;
        List<DataCircleModel> lista = List.of(model);

        when(service.listarPorPaciente(pacienteId)).thenReturn(lista);

        ResponseEntity<List<DataCircleModel>> response = controller.getByPatient(pacienteId);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(lista, response.getBody());
        verify(service).listarPorPaciente(pacienteId);
    }
}
