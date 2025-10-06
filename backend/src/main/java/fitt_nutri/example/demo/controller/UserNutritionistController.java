package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.LoginRequest;
import fitt_nutri.example.demo.dto.request.UserNutritionistRequest;
import fitt_nutri.example.demo.dto.response.UserNutritionistResponse;
import fitt_nutri.example.demo.service.UserNutritionistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nutritionists")
@CrossOrigin(origins = "http://localhost:5500")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "CRUD de nutricionistas")
public class UserNutritionistController {

    private final UserNutritionistService service;

    @Operation(summary = "Cria um novo nutricionista")
    @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso")
    @ApiResponse(responseCode = "409", description = "Email, CPF ou CRN já cadastrados")
    @PostMapping
    public ResponseEntity<UserNutritionistResponse> cadastrar(@Valid @RequestBody UserNutritionistRequest request) {
        UserNutritionistResponse response = service.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Lista todos os nutricionistas")
    @ApiResponse(responseCode = "200", description = "Usuários encontrados com sucesso")
    @ApiResponse(responseCode = "204", description = "Nenhum usuário encontrado")
    @GetMapping
    public ResponseEntity<List<UserNutritionistResponse>> listarTodos() {
        List<UserNutritionistResponse> users = service.listarTodos();
        return users.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(users);
    }

    @Operation(summary = "Busca um nutricionista por ID")
    @ApiResponse(responseCode = "200", description = "Usuário encontrado")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<UserNutritionistResponse> buscarPorId(@PathVariable Integer id) {
        UserNutritionistResponse response = service.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Atualiza um nutricionista por ID")
    @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    @PutMapping("/{id}")
    public ResponseEntity<UserNutritionistResponse> atualizar(@PathVariable Integer id,
                                                              @Valid @RequestBody UserNutritionistRequest request) {
        UserNutritionistResponse response = service.atualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Exclui um nutricionista por ID")
    @ApiResponse(responseCode = "204", description = "Usuário excluído com sucesso")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Login de nutricionista")
    @ApiResponse(responseCode = "200", description = "Login realizado com sucesso")
    @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    @PostMapping("/login")
    public ResponseEntity<UserNutritionistResponse> login(@RequestBody LoginRequest loginRequest) {
        UserNutritionistResponse response = service.login(loginRequest);
        return ResponseEntity.ok(response);
    }

}
