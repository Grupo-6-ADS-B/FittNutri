package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.SchedulingAdapter;
import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
import fitt_nutri.example.demo.dto.response.SchedulingResponseDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SchedulingControllerTest {

    @InjectMocks
    private SchedulingController controller;

    @Mock
    private SchedulingAdapter adapter;

    // ---------- POST /schedulings ----------

    @Test
    @DisplayName("create - deve retornar 201 e agendamento criado")
    void create_DeveRetornar201EAgendamentoCriado() {
        SchedulingRequestDTO dto = mock(SchedulingRequestDTO.class);
        SchedulingResponseDTO responseDTO = mock(SchedulingResponseDTO.class);

        when(adapter.create(dto)).thenReturn(responseDTO);

        ResponseEntity<SchedulingResponseDTO> response = controller.create(dto);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(adapter).create(dto);
    }

    // ---------- GET /schedulings ----------

    @Test
    @DisplayName("getAll - deve retornar 200 e lista de agendamentos")
    void getAll_DeveRetornar200ELista() {
        List<SchedulingResponseDTO> list = List.of(mock(SchedulingResponseDTO.class));
        when(adapter.getAll()).thenReturn(list);

        ResponseEntity<List<SchedulingResponseDTO>> response = controller.getAll();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(list, response.getBody());
        verify(adapter).getAll();
    }

    // ---------- GET /schedulings/{id} ----------

    @Test
    @DisplayName("getById - deve retornar 200 e agendamento existente")
    void getById_DeveRetornar200EAgendamento() {
        Integer id = 1;
        SchedulingResponseDTO dto = mock(SchedulingResponseDTO.class);

        when(adapter.getById(id)).thenReturn(dto);

        ResponseEntity<SchedulingResponseDTO> response = controller.getById(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
        verify(adapter).getById(id);
    }

    // ---------- GET /schedulings/patient/{id} ----------

    @Test
    @DisplayName("getByPatient - deve retornar 200 e lista do paciente")
    void getByPatient_DeveRetornar200ELista() {
        Integer id = 2;
        List<SchedulingResponseDTO> list = List.of(mock(SchedulingResponseDTO.class));

        when(adapter.getByPatient(id)).thenReturn(list);

        ResponseEntity<List<SchedulingResponseDTO>> response = controller.getByPatient(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(list, response.getBody());
        verify(adapter).getByPatient(id);
    }

    // ---------- GET /schedulings/nutritionist/{id} ----------

    @Test
    @DisplayName("getByNutritionist - deve retornar 200 e página do nutricionista")
    void getByNutritionist_DeveRetornar200ELista() {
        Integer id = 3;
        List<SchedulingResponseDTO> list = List.of(mock(SchedulingResponseDTO.class));
        Page<SchedulingResponseDTO> page = new PageImpl<>(list);

        when(adapter.getByNutritionist(eq(id), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<SchedulingResponseDTO>> response = controller.getByNutritionist(id, 0, 20);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(page, response.getBody());
        verify(adapter).getByNutritionist(eq(id), any(Pageable.class));
    }

    // ---------- PUT /schedulings/{id} ----------

    @Test
    @DisplayName("update - deve retornar 200 e agendamento atualizado")
    void update_DeveRetornar200EAtualizado() {
        Integer id = 10;
        SchedulingRequestDTO dto = mock(SchedulingRequestDTO.class);
        SchedulingResponseDTO updated = mock(SchedulingResponseDTO.class);

        when(adapter.update(id, dto)).thenReturn(updated);

        ResponseEntity<SchedulingResponseDTO> response = controller.update(id, dto);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(updated, response.getBody());
        verify(adapter).update(id, dto);
    }

    // ---------- PATCH /schedulings/{id}/date ----------

    @Test
    @DisplayName("updateDate - deve retornar 200 e data atualizada")
    void updateDate_DeveRetornar200EAtualizarData() {
        Integer id = 1;
        LocalDate novaData = LocalDate.now();

        SchedulingResponseDTO dto = mock(SchedulingResponseDTO.class);

        when(adapter.updateDate(id, novaData)).thenReturn(dto);

        ResponseEntity<SchedulingResponseDTO> response = controller.updateDate(id, novaData);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
        verify(adapter).updateDate(id, novaData);
    }

    // ---------- PATCH /schedulings/{id}/observacoes ----------

    @Test
    @DisplayName("updateObservacoes - deve retornar 200 e observações atualizadas")
    void updateObservacoes_DeveRetornar200() {
        Integer id = 5;
        String obs = "Nova observação";

        SchedulingResponseDTO dto = mock(SchedulingResponseDTO.class);

        when(adapter.updateObservacoes(id, obs)).thenReturn(dto);

        ResponseEntity<SchedulingResponseDTO> response = controller.updateObservacoes(id, obs);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
        verify(adapter).updateObservacoes(id, obs);
    }

    // ---------- DELETE /schedulings/{id} ----------

    @Test
    @DisplayName("delete - deve retornar 204 quando excluir com sucesso")
    void delete_DeveRetornar204() {
        Integer id = 99;

        ResponseEntity<Void> response = controller.delete(id);

        assertEquals(204, response.getStatusCodeValue());
        verify(adapter).delete(id);
    }
}
