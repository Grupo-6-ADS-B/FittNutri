package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.FormAdapter;
import fitt_nutri.example.demo.dto.request.FormRequestDTO;
import fitt_nutri.example.demo.dto.response.FormResponseDTO;
import fitt_nutri.example.demo.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormControllerTest {

    @InjectMocks
    private FormController controller;

    @Mock
    private FormAdapter formAdapter;

    @Mock
    private EmailService emailService;

    // ---------- POST /forms ----------

    @Test
    @DisplayName("createForm - deve retornar 201 e formulário criado")
    void createForm_DeveRetornar201EFormCriado() {
        FormRequestDTO request = mock(FormRequestDTO.class);
        FormResponseDTO responseDTO = mock(FormResponseDTO.class);

        when(formAdapter.create(request)).thenReturn(responseDTO);

        ResponseEntity<FormResponseDTO> response = controller.createForm(request);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(formAdapter).create(request);
    }

    // ---------- GET /forms ----------

    @Test
    @DisplayName("getAllForms - deve retornar 200 e lista quando houver formulários")
    void getAllForms_DeveRetornar200ELista() {
        List<FormResponseDTO> lista = List.of(mock(FormResponseDTO.class));
        when(formAdapter.getAll()).thenReturn(lista);

        ResponseEntity<List<FormResponseDTO>> response = controller.getAllForms();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(lista, response.getBody());
        verify(formAdapter).getAll();
    }

    @Test
    @DisplayName("getAllForms - deve retornar 204 quando lista estiver vazia")
    void getAllForms_DeveRetornar204QuandoListaVazia() {
        when(formAdapter.getAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<FormResponseDTO>> response = controller.getAllForms();

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formAdapter).getAll();
    }

    // ---------- GET /forms/{id} ----------

    @Test
    @DisplayName("getFormById - deve retornar 200 e formulário quando encontrado")
    void getFormById_DeveRetornar200EForm() {
        Integer id = 1;
        FormResponseDTO dto = mock(FormResponseDTO.class);

        when(formAdapter.getById(id)).thenReturn(dto);

        ResponseEntity<FormResponseDTO> response = controller.getFormById(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
        verify(formAdapter).getById(id);
    }

    @Test
    @DisplayName("getFormById - deve retornar 404 quando formulário não for encontrado")
    void getFormById_DeveRetornar404QuandoNaoEncontrado() {
        Integer id = 1;

        when(formAdapter.getById(id))
                .thenThrow(new IllegalArgumentException("Formulário não encontrado"));

        ResponseEntity<FormResponseDTO> response = controller.getFormById(id);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formAdapter).getById(id);
    }

    // ---------- PUT /forms/{id} ----------

    @Test
    @DisplayName("updateForm - deve retornar 200 e formulário atualizado")
    void updateForm_DeveRetornar200EFormAtualizado() {
        Integer id = 1;
        FormRequestDTO request = mock(FormRequestDTO.class);
        FormResponseDTO responseDTO = mock(FormResponseDTO.class);

        when(formAdapter.update(id, request)).thenReturn(responseDTO);

        ResponseEntity<FormResponseDTO> response = controller.updateForm(id, request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(formAdapter).update(id, request);
    }

    @Test
    @DisplayName("updateForm - deve retornar 404 quando formulário não for encontrado")
    void updateForm_DeveRetornar404QuandoNaoEncontrado() {
        Integer id = 1;
        FormRequestDTO request = mock(FormRequestDTO.class);

        when(formAdapter.update(id, request))
                .thenThrow(new IllegalArgumentException("Formulário não encontrado"));

        ResponseEntity<FormResponseDTO> response = controller.updateForm(id, request);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formAdapter).update(id, request);
    }

    @Test
    @DisplayName("updateForm - deve retornar 400 quando parâmetros forem inválidos")
    void updateForm_DeveRetornar400QuandoParametrosInvalidos() {
        Integer id = 1;
        FormRequestDTO request = mock(FormRequestDTO.class);

        when(formAdapter.update(id, request))
                .thenThrow(new IllegalArgumentException("Parâmetros inválidos"));

        ResponseEntity<FormResponseDTO> response = controller.updateForm(id, request);

        assertEquals(400, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formAdapter).update(id, request);
    }

    // ---------- DELETE /forms/{id} ----------

    @Test
    @DisplayName("deleteForm - deve retornar 204 quando deletar com sucesso")
    void deleteForm_DeveRetornar204() {
        Integer id = 1;

        ResponseEntity<Void> response = controller.deleteForm(id);

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formAdapter).delete(id);
    }

    @Test
    @DisplayName("deleteForm - deve retornar 404 quando formulário não for encontrado")
    void deleteForm_DeveRetornar404QuandoNaoEncontrado() {
        Integer id = 1;

        doThrow(new IllegalArgumentException("Formulário não encontrado"))
                .when(formAdapter).delete(id);

        ResponseEntity<Void> response = controller.deleteForm(id);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formAdapter).delete(id);
    }
}
