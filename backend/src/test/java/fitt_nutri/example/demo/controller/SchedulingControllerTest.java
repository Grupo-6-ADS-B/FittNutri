package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
import fitt_nutri.example.demo.dto.response.SchedulingResponseDTO;
import fitt_nutri.example.demo.service.SchedulingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SchedulingControllerTest {

    @InjectMocks
    private SchedulingController controller;

    @Mock
    private SchedulingService service;

    // ---------- POST /schedulings ----------

    @Test
    @DisplayName("create - deve retornar 201 e agendamento criado")
    void create_DeveRetornar201EAgendamentoCriado() {
        SchedulingRequestDTO dto = mock(SchedulingRequestDTO.class);
        SchedulingResponseDTO responseDTO = mock(SchedulingResponseDTO.class);

        when(service.createAndReturn(dto)).thenReturn(responseDTO);

        ResponseEntity<SchedulingResponseDTO> response = controller.create(dto);

        assertEquals(201, response.getStatusCode().value());
        assertEquals(responseDTO, response.getBody());
        verify(service).createAndReturn(dto);
    }

    // ---------- GET /schedulings ----------

    @Test
    @DisplayName("getAll - deve retornar 200 e lista de agendamentos")
    void getAll_DeveRetornar200ELista() {
        List<SchedulingResponseDTO> list = List.of(mock(SchedulingResponseDTO.class));
        when(service.getAllAndReturn()).thenReturn(list);

        ResponseEntity<List<SchedulingResponseDTO>> response = controller.getAll();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(list, response.getBody());
        verify(service).getAllAndReturn();
    }

    // ---------- GET /schedulings/{id} ----------

    @Test
    @DisplayName("getById - deve retornar 200 e agendamento existente")
    void getById_DeveRetornar200EAgendamento() {
        Integer id = 1;
        SchedulingResponseDTO dto = mock(SchedulingResponseDTO.class);

        when(service.getByIdAndReturn(id)).thenReturn(dto);

        ResponseEntity<SchedulingResponseDTO> response = controller.getById(id);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(dto, response.getBody());
        verify(service).getByIdAndReturn(id);
    }

    // ---------- GET /schedulings/patient/{id} ----------

    @Test
    @DisplayName("getByPatient - deve retornar 200 e lista do paciente")
    void getByPatient_DeveRetornar200ELista() {
        Integer id = 2;
        List<SchedulingResponseDTO> list = List.of(mock(SchedulingResponseDTO.class));

        when(service.getByPatientAndReturn(id)).thenReturn(list);

        ResponseEntity<List<SchedulingResponseDTO>> response = controller.getByPatient(id);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(list, response.getBody());
        verify(service).getByPatientAndReturn(id);
    }

    // ---------- GET /schedulings/nutritionist/{id} ----------

    @Test
    @DisplayName("getByNutritionist - deve retornar 200 e lista do nutricionista")
    void getByNutritionist_DeveRetornar200ELista() {
        Integer id = 3;
        SchedulingResponseDTO mockDto = mock(SchedulingResponseDTO.class);
        Page<SchedulingResponseDTO> page = new PageImpl<>(List.of(mockDto), PageRequest.of(0, 20), 1);

        when(service.getByNutritionistAndReturn(id, PageRequest.of(0, 20))).thenReturn(page);

        ResponseEntity<Page<SchedulingResponseDTO>> response = controller.getByNutritionist(id, 0, 20);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(page, response.getBody());
        verify(service).getByNutritionistAndReturn(id, PageRequest.of(0, 20));
    }

    // ---------- PUT /schedulings/{id} ----------

    @Test
    @DisplayName("update - deve retornar 200 e agendamento atualizado")
    void update_DeveRetornar200EAtualizado() {
        Integer id = 10;
        SchedulingRequestDTO dto = mock(SchedulingRequestDTO.class);
        SchedulingResponseDTO updated = mock(SchedulingResponseDTO.class);

        when(service.updateAndReturn(id, dto)).thenReturn(updated);

        ResponseEntity<SchedulingResponseDTO> response = controller.update(id, dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(updated, response.getBody());
        verify(service).updateAndReturn(id, dto);
    }

    // ---------- PATCH /schedulings/{id}/date ----------

    @Test
    @DisplayName("updateDate - deve retornar 200 e data atualizada")
    void updateDate_DeveRetornar200EAtualizarData() {
        Integer id = 1;
        LocalDate novaData = LocalDate.now();

        SchedulingResponseDTO dto = mock(SchedulingResponseDTO.class);

        when(service.updateDateAndReturn(id, novaData)).thenReturn(dto);

        ResponseEntity<SchedulingResponseDTO> response = controller.updateDate(id, novaData);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(dto, response.getBody());
        verify(service).updateDateAndReturn(id, novaData);
    }

    // ---------- PATCH /schedulings/{id}/observacoes ----------

    @Test
    @DisplayName("updateObservacoes - deve retornar 200 e observações atualizadas")
    void updateObservacoes_DeveRetornar200() {
        Integer id = 5;
        String obs = "Nova observação";

        SchedulingResponseDTO dto = mock(SchedulingResponseDTO.class);

        when(service.updateObservacoeseAndReturn(id, obs)).thenReturn(dto);

        ResponseEntity<SchedulingResponseDTO> response = controller.updateObservacoes(id, obs);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(dto, response.getBody());
        verify(service).updateObservacoeseAndReturn(id, obs);
    }

    // ---------- DELETE /schedulings/{id} ----------

    @Test
    @DisplayName("delete - deve retornar 204 quando excluir com sucesso")
    void delete_DeveRetornar204() {
        Integer id = 99;

        ResponseEntity<Void> response = controller.delete(id);

        assertEquals(204, response.getStatusCode().value());
        verify(service).deleteScheduling(id);
    }
}
