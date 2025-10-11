package fitt_nutri.example.demo.controller;


import fitt_nutri.example.demo.dto.request.LoginRequestDTO;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.dto.response.UserResponseDTO;
import fitt_nutri.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5500")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "CRUD de usuários")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Cria um usuário")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO dto) {
        return ResponseEntity.status(201).body(userService.createUser(dto));
    }

    @GetMapping
    @Operation(summary = "Lista todos os usuários")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return users.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca usuário por ID")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Busca usuário por email")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/cpf/{cpf}")
    @Operation(summary = "Busca usuário por CPF")
    public ResponseEntity<UserResponseDTO> getUserByCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(userService.getUserByCpf(cpf));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza usuário por ID")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Integer id, @Valid @RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um usuário por ID")
    public ResponseEntity<UserResponseDTO> patchUser(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(userService.patchUser(id, updates));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui usuário por ID")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

}
