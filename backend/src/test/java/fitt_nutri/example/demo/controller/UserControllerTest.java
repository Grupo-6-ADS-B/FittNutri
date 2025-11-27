package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.UserAdapter;
import fitt_nutri.example.demo.dto.login.LoginListDTO;
import fitt_nutri.example.demo.dto.login.LoginRequestDTO;
import fitt_nutri.example.demo.dto.login.LoginTokenDTO;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.dto.response.UserResponseDTO;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.service.LoginService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @InjectMocks
    private UserController controller;

    @Mock
    private UserAdapter adapter;

    @Mock
    private LoginService service;

    // ---------- /users/login ----------

    @Test
    @DisplayName("loginUser - deve retornar 200 e token quando senha for válida")
    void loginUser_DeveRetornar200EToken_QuandoSenhaValida() {
        LoginRequestDTO dto = new LoginRequestDTO("teste@fittnutri.com", "123456");


        LoginTokenDTO tokenMock = mock(LoginTokenDTO.class);
        when(service.autenticar(any(UserModel.class))).thenReturn(tokenMock);

        ResponseEntity<LoginTokenDTO> response = controller.loginUser(dto);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(tokenMock, response.getBody());
        verify(service).autenticar(any(UserModel.class));
    }

    @Test
    @DisplayName("loginUser - deve retornar 400 quando senha estiver vazia")
    void loginUser_DeveRetornar400_QuandoSenhaVazia() {
        LoginRequestDTO dto = new LoginRequestDTO("teste@fittnutri.com", " ");


        ResponseEntity<LoginTokenDTO> response = controller.loginUser(dto);

        assertEquals(400, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(service, never()).autenticar(any());
    }

    // ---------- GET /users ----------

    @Test
    @DisplayName("getAllUsers - deve retornar 200 e lista quando existirem usuários")
    void getAllUsers_DeveRetornar200ELista_QuandoExistiremUsuarios() {
        List<LoginListDTO> lista = List.of(mock(LoginListDTO.class));
        when(service.listarUsuarios()).thenReturn(lista);

        ResponseEntity<List<LoginListDTO>> response = controller.getAllUsers();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(lista, response.getBody());
        verify(service).listarUsuarios();
    }

    @Test
    @DisplayName("getAllUsers - deve retornar 204 quando não existirem usuários")
    void getAllUsers_DeveRetornar204_QuandoListaVazia() {
        when(service.listarUsuarios()).thenReturn(Collections.emptyList());

        ResponseEntity<List<LoginListDTO>> response = controller.getAllUsers();

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(service).listarUsuarios();
    }

    // ---------- GET /users/{id} ----------

    @Test
    @DisplayName("getUserById - deve retornar 200 e o usuário quando encontrado")
    void getUserById_DeveRetornar200EUsuario() {
        Integer id = 1;
        UserResponseDTO dto = mock(UserResponseDTO.class);
        when(adapter.getUserById(id)).thenReturn(dto);

        ResponseEntity<UserResponseDTO> response = controller.getUserById(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
        verify(adapter).getUserById(id);
    }

    // ---------- PUT /users/{id} ----------

    @Test
    @DisplayName("updateUser - deve retornar 200 e usuário atualizado")
    void updateUser_DeveRetornar200EUsuarioAtualizado() {
        Integer id = 1;
        UserRequestDTO request = mock(UserRequestDTO.class);
        UserResponseDTO responseDTO = mock(UserResponseDTO.class);

        when(adapter.updateUser(id, request)).thenReturn(responseDTO);

        ResponseEntity<UserResponseDTO> response = controller.updateUser(id, request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(adapter).updateUser(id, request);
    }

    // ---------- PATCH /users/{id} ----------

    @Test
    @DisplayName("patchUser - deve retornar 200 e usuário parcialmente atualizado")
    void patchUser_DeveRetornar200EUsuarioAtualizadoParcialmente() {
        Integer id = 1;
        Map<String, Object> updates = Map.of("nome", "Novo Nome");
        UserResponseDTO responseDTO = mock(UserResponseDTO.class);

        when(adapter.patchUser(id, updates)).thenReturn(responseDTO);

        ResponseEntity<UserResponseDTO> response = controller.patchUser(id, updates);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
        verify(adapter).patchUser(id, updates);
    }

    // ---------- DELETE /users/{id} ----------

    @Test
    @DisplayName("deleteUser - deve retornar 204 quando excluir com sucesso")
    void deleteUser_DeveRetornar204() {
        Integer id = 1;

        // adapter.deleteUser não retorna nada, só verificamos a chamada
        ResponseEntity<Void> response = controller.deleteUser(id);

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(adapter).deleteUser(id);
    }
}
