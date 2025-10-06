package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.UserPatientRequest;
import fitt_nutri.example.demo.dto.response.UserPatientResponse;
import fitt_nutri.example.demo.service.UserPatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@CrossOrigin(origins = "http://localhost:5500")
@RequiredArgsConstructor
@Tag(name = "Pacientes", description = "Pesquisa e Utilidades de pacientes")
public class UserPatientController {

    private final UserPatientService service;

    @PostMapping
    @Operation(
            summary = "Cadastra um novo paciente",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Paciente cadastrado com sucesso", content = @Content(schema = @Schema(implementation = UserPatientResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos (validação)", content = @Content(schema = @Schema(implementation = String.class))),
                    @ApiResponse(responseCode = "409", description = "Conflito: Paciente já cadastrado (Regra de Negócio)", content = @Content(schema = @Schema(implementation = String.class)))
            }
    )
    public ResponseEntity<UserPatientResponse> cadastrar(@Valid @RequestBody UserPatientRequest request) {
        UserPatientResponse response = service.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "Lista todos os pacientes",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de pacientes retornada com sucesso", content = @Content(schema = @Schema(implementation = UserPatientResponse.class))),
                    @ApiResponse(responseCode = "204", description = "Nenhum paciente encontrado")
            }
    )
    public ResponseEntity<List<UserPatientResponse>> listarTodos() {
        List<UserPatientResponse> patients = service.listarTodos();
        return patients.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(patients);
    }

    @GetMapping("/search")
    @Operation(
            summary = "Busca pacientes pelo nome (ou parte dele)",
            description = "Retorna uma lista de pacientes cujo nome contenha o termo de pesquisa.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Pacientes encontrados", content = @Content(schema = @Schema(implementation = UserPatientResponse.class))),
                    @ApiResponse(responseCode = "204", description = "Nenhum paciente encontrado com esse nome")
            }
    )
    public ResponseEntity<List<UserPatientResponse>> buscarPorNome(@RequestParam String nome) {
        List<UserPatientResponse> patients = service.buscarPorNome(nome);
        return patients.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Busca um paciente por ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Paciente encontrado com sucesso", content = @Content(schema = @Schema(implementation = UserPatientResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content(schema = @Schema(implementation = String.class)))
            }
    )
    public ResponseEntity<UserPatientResponse> buscarPorId(@PathVariable Integer id) {
        UserPatientResponse response = service.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Atualiza COMPLETAMENTE um paciente por ID",
            description = "Substitui todos os dados do paciente (PUT).",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso", content = @Content(schema = @Schema(implementation = UserPatientResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos (validação)", content = @Content(schema = @Schema(implementation = String.class))),
                    @ApiResponse(responseCode = "404", description = "Paciente não encontrado para atualização", content = @Content(schema = @Schema(implementation = String.class)))
            }
    )
    public ResponseEntity<UserPatientResponse> atualizar(@PathVariable Integer id,
                                                         @Valid @RequestBody UserPatientRequest request) {
        UserPatientResponse response = service.atualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(
            summary = "Atualiza PARCIALMENTE um paciente por ID",
            description = "Atualiza apenas os campos presentes no corpo da requisição (PATCH).",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Paciente atualizado parcialmente com sucesso", content = @Content(schema = @Schema(implementation = UserPatientResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos (validação)", content = @Content(schema = @Schema(implementation = String.class))),
                    @ApiResponse(responseCode = "404", description = "Paciente não encontrado para atualização parcial", content = @Content(schema = @Schema(implementation = String.class)))
            }
    )
    public ResponseEntity<UserPatientResponse> atualizarParcial(@PathVariable Integer id,
                                                                @RequestBody UserPatientRequest request) {
        UserPatientResponse response = service.atualizarParcial(id, request);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{id}")
    @Operation(
            summary = "Exclui um paciente por ID",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Paciente excluído com sucesso"),
                    @ApiResponse(responseCode = "404", description = "Paciente não encontrado para exclusão", content = @Content(schema = @Schema(implementation = String.class)))
            }
    )
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @Operation(
            summary = "Retorna a contagem total de pacientes cadastrados",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Contagem total de pacientes", content = @Content(schema = @Schema(implementation = Long.class)))
            }
    )
    public ResponseEntity<Long> contarTodos() {
        long count = service.contarTodos();
        return ResponseEntity.ok(count);
    }
}