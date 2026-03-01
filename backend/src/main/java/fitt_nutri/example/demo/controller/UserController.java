    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody fitt_nutri.example.demo.dto.login.GoogleLoginDTO dto) {
        try {
            // Valida o token do Google
            var payload = fitt_nutri.example.demo.util.GoogleTokenVerifierUtil.verify(dto.token);
            String email = (String) payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String sub = (String) payload.getSubject();

            // Busca usuário por email
            var userOpt = service.getUserByEmail(email);
            fitt_nutri.example.demo.model.UserModel user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                // Cria novo usuário Google
                user = new fitt_nutri.example.demo.model.UserModel();
                user.setNome(name);
                user.setEmail(email);
                user.setSenha(""); // senha vazia para Google
                user.setCpf("GOOGLE-" + sub); // marca como Google
                user.setCrn("GOOGLE");
                user.setFoto(picture);
                service.criar(user);
            }

            // Gera JWT próprio da aplicação
            String jwt = service.gerarToken(user);
            return ResponseEntity.ok(Map.of(
                "token", jwt,
                "id", user.getId(),
                "nome", user.getNome(),
                "email", user.getEmail(),
                "foto", user.getFoto()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Token Google inválido ou erro de autenticação."));
        }
    }
package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.UserAdapter;
import fitt_nutri.example.demo.dto.login.*;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.dto.response.UserResponseDTO;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.service.LoginService;
import fitt_nutri.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "CRUD de usuários")
public class UserController {

    private final UserAdapter adapter;
    private final LoginService service;

    @PostMapping
    public ResponseEntity<Void> createUser(@Valid @RequestBody LoginCreateDTO dto) {
        final UserModel user = LoginMapperDTO.of(dto);
        service.criar(user);
        return ResponseEntity.status(201).build();

    }

    // java
    @PostMapping("/login")
    public ResponseEntity<LoginTokenDTO> loginUser(@Valid @RequestBody LoginRequestDTO dto) {
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        final UserModel user = LoginMapperDTO.of(dto);
        LoginTokenDTO loginTokenDTO = service.autenticar(user);
        return ResponseEntity.ok(loginTokenDTO);
    }


    @GetMapping
    @SecurityRequirement(name = "Bearer")
    public ResponseEntity<List<LoginListDTO>> getAllUsers() {
        List<LoginListDTO> users = service.listarUsuarios();
        if(users.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(adapter.getUserById(id));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Busca usuário por email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(adapter.getUserByEmail(email));
    }

    @GetMapping("/cpf/{cpf}")
    @Operation(summary = "Busca usuário por CPF")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> getUserByCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(adapter.getUserByCpf(cpf));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Integer id, @Valid @RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(adapter.updateUser(id, dto));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> patchUser(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(adapter.patchUser(id, updates));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuário excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        adapter.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

}
