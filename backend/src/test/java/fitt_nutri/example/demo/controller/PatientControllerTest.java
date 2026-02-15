package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.PatientAdapter;
import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientControllerTest {

    @InjectMocks
    private PatientController controller;

    @Mock
    private PatientAdapter adapter;

    // ---------- POST /patients ----------

    @Test
    @DisplayName("createPatient - deve retornar 201 e paciente criado")
    void createPatient_DeveRetornar201EPacienteCriado() {
        PatientRequestDTO request = mock(PatientRequestDTO.class);
        PatientResponseDTO responseDTO = mock(PatientResponseDTO.class);

        when(adapter.create(request)).thenReturn(responseDTO);

        ResponseEntity<PatientResponseDTO> response = controller.createPatient(request);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(adapter).create(request);
    }

    // ---------- GET /patients ----------

    @Test
    @DisplayName("getAllPatients - deve retornar 200 e lista de pacientes")
    void getAllPatients_DeveRetornar200ELista() {
        List<PatientResponseDTO> lista = List.of(mock(PatientResponseDTO.class));
        when(adapter.getAll()).thenReturn(lista);

        ResponseEntity<List<PatientResponseDTO>> response = controller.getAllPatients();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(lista, response.getBody());
        verify(adapter).getAll();
    }

    // ---------- GET /patients/{id} ----------

    @Test
    @DisplayName("getPatientById - deve retornar 200 e paciente quando encontrado")
    void getPatientById_DeveRetornar200EPaciente() {
        Integer id = 1;
        PatientResponseDTO dto = mock(PatientResponseDTO.class);
        when(adapter.getById(id)).thenReturn(dto);

        ResponseEntity<PatientResponseDTO> response = controller.getPatientById(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
        verify(adapter).getById(id);
    }

    // ---------- PUT /patients/{id} ----------

    @Test
    @DisplayName("updatePatient - deve retornar 200 e paciente atualizado")
    void updatePatient_DeveRetornar200EPacienteAtualizado() {
        Integer id = 1;
        PatientRequestDTO request = mock(PatientRequestDTO.class);
        PatientResponseDTO responseDTO = mock(PatientResponseDTO.class);

        when(adapter.update(id, request)).thenReturn(responseDTO);

        ResponseEntity<PatientResponseDTO> response = controller.updatePatient(id, request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(adapter).update(id, request);
    }

    // ---------- PATCH /patients/{id} ----------

    @Test
    @DisplayName("patchPatient - deve retornar 200 e paciente atualizado parcialmente")
    void patchPatient_DeveRetornar200EPacienteAtualizadoParcialmente() {
        Integer id = 1;
        Map<String, Object> updates = Map.of("nome", "Novo Nome");
        PatientResponseDTO responseDTO = mock(PatientResponseDTO.class);

        when(adapter.patch(id, updates)).thenReturn(responseDTO);

        ResponseEntity<PatientResponseDTO> response = controller.patchPatient(id, updates);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(adapter).patch(id, updates);
    }

    // ---------- DELETE /patients/{id} ----------

    @Test
    @DisplayName("deletePatient - deve retornar 204 quando excluir com sucesso")
    void deletePatient_DeveRetornar204() {
        Integer id = 1;

        ResponseEntity<Void> response = controller.deletePatient(id);

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(adapter).delete(id);
    }
}
