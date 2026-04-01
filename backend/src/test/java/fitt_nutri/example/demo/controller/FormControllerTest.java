package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.FormRequestDTO;
import fitt_nutri.example.demo.dto.response.FormResponseDTO;
import fitt_nutri.example.demo.service.FormService;
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
    private FormService formService;

    // ---------- POST /forms ----------

    @Test
    @DisplayName("createForm - deve retornar 201 e formulário criado")
    void createForm_DeveRetornar201EFormCriado() {
        FormRequestDTO request = mock(FormRequestDTO.class);
        FormResponseDTO responseDTO = mock(FormResponseDTO.class);

        when(formService.createFormAndReturn(request)).thenReturn(responseDTO);

        ResponseEntity<FormResponseDTO> response = controller.createForm(request);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(formService).createFormAndReturn(request);
    }

    // ---------- GET /forms ----------

    @Test
    @DisplayName("getAllForms - deve retornar 200 e lista quando houver formulários")
    void getAllForms_DeveRetornar200ELista() {
        List<FormResponseDTO> lista = List.of(mock(FormResponseDTO.class));
        when(formService.getAllFormsAndReturn()).thenReturn(lista);

        ResponseEntity<List<FormResponseDTO>> response = controller.getAllForms();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(lista, response.getBody());
        verify(formService).getAllFormsAndReturn();
    }

    @Test
    @DisplayName("getAllForms - deve retornar 204 quando lista estiver vazia")
    void getAllForms_DeveRetornar204QuandoListaVazia() {
        when(formService.getAllFormsAndReturn()).thenReturn(Collections.emptyList());

        ResponseEntity<List<FormResponseDTO>> response = controller.getAllForms();

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formService).getAllFormsAndReturn();
    }

    // ---------- GET /forms/{id} ----------

    @Test
    @DisplayName("getFormById - deve retornar 200 e formulário quando encontrado")
    void getFormById_DeveRetornar200EForm() {
        Integer id = 1;
        FormResponseDTO dto = mock(FormResponseDTO.class);

        when(formService.getFormByIdAndReturn(id)).thenReturn(dto);

        ResponseEntity<FormResponseDTO> response = controller.getFormById(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
        verify(formService).getFormByIdAndReturn(id);
    }

    @Test
    @DisplayName("getFormById - deve retornar 404 quando formulário não for encontrado")
    void getFormById_DeveRetornar404QuandoNaoEncontrado() {
        Integer id = 1;

        when(formService.getFormByIdAndReturn(id))
                .thenThrow(new IllegalArgumentException("Formulário não encontrado"));

        ResponseEntity<FormResponseDTO> response = controller.getFormById(id);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formService).getFormByIdAndReturn(id);
    }

    // ---------- PUT /forms/{id} ----------

    @Test
    @DisplayName("updateForm - deve retornar 200 e formulário atualizado")
    void updateForm_DeveRetornar200EFormAtualizado() {
        Integer id = 1;
        FormRequestDTO request = mock(FormRequestDTO.class);
        FormResponseDTO responseDTO = mock(FormResponseDTO.class);

        when(formService.updateFormAndReturn(id, request)).thenReturn(responseDTO);

        ResponseEntity<FormResponseDTO> response = controller.updateForm(id, request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(formService).updateFormAndReturn(id, request);
    }

    @Test
    @DisplayName("updateForm - deve retornar 404 quando formulário não for encontrado")
    void updateForm_DeveRetornar404QuandoNaoEncontrado() {
        Integer id = 1;
        FormRequestDTO request = mock(FormRequestDTO.class);

        when(formService.updateFormAndReturn(id, request))
                .thenThrow(new IllegalArgumentException("Formulário não encontrado"));

        ResponseEntity<FormResponseDTO> response = controller.updateForm(id, request);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formService).updateFormAndReturn(id, request);
    }

    @Test
    @DisplayName("updateForm - deve retornar 400 quando parâmetros forem inválidos")
    void updateForm_DeveRetornar400QuandoParametrosInvalidos() {
        Integer id = 1;
        FormRequestDTO request = mock(FormRequestDTO.class);

        when(formService.updateFormAndReturn(id, request))
                .thenThrow(new IllegalArgumentException("Parâmetros inválidos"));

        ResponseEntity<FormResponseDTO> response = controller.updateForm(id, request);

        assertEquals(400, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formService).updateFormAndReturn(id, request);
    }

    // ---------- DELETE /forms/{id} ----------

    @Test
    @DisplayName("deleteForm - deve retornar 204 quando deletar com sucesso")
    void deleteForm_DeveRetornar204() {
        Integer id = 1;

        ResponseEntity<Void> response = controller.deleteForm(id);

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formService).deleteForm(id);
    }

    @Test
    @DisplayName("deleteForm - deve retornar 404 quando formulário não for encontrado")
    void deleteForm_DeveRetornar404QuandoNaoEncontrado() {
        Integer id = 1;

        doThrow(new IllegalArgumentException("Formulário não encontrado"))
                .when(formService).deleteForm(id);

        ResponseEntity<Void> response = controller.deleteForm(id);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(formService).deleteForm(id);
    }
}
