package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.service.DataCircleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/data-circle")
@RequiredArgsConstructor
@Tag(name = "Dados Circunferência", description = "CRUD para gerenciar os dados de circunferência")
public class DataCircleController {

    private final DataCircleService service;

    @PostMapping
    @Operation(summary = "Cria um novo registro de dados de circunferência")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Registro criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Requisição inválida"),
            @ApiResponse(responseCode = "409", description = "Conflito: Rótulo já existe")
    })
    public ResponseEntity<DataCircleModel> cadastrar(@Valid @RequestBody DataCircleModel body) {
        DataCircleModel saved = service.cadastrar(body);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getIdDadosCircunferencia())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @GetMapping
    @Operation(summary = "Recupera todos os registros de dados de circunferência")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registros recuperados com sucesso"),
            @ApiResponse(responseCode = "404", description = "Nenhum registro encontrado")
    })
    public ResponseEntity<List<DataCircleModel>> pegarTodos() {
        List<DataCircleModel> dadosRecuperados = service.pegarTodos();
        return ResponseEntity.ok(dadosRecuperados);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Recupera um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro recuperado com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado")
    })
    public ResponseEntity<DataCircleModel> pegarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.pegarPorId(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido ou dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito: Rótulo já existe")
    })
    public ResponseEntity<DataCircleModel> atualizar(@PathVariable Integer id,
                                                     @Valid @RequestBody DataCircleModel body) {
        return ResponseEntity.ok(service.atualizar(id, body));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro atualizado parcialmente com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido ou dados inválidos no corpo da requisição"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito: Rótulo já existe")
    })
    public ResponseEntity<DataCircleModel> atualizarParcial(@PathVariable Integer id,
                                                            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(service.atualizarParcial(id, updates));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deleta um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Registro deletado com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado")
    })
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @Operation(summary = "Conta o número total de registros")
    public ResponseEntity<Long> contarRegistros() {
        return ResponseEntity.ok(service.contarRegistros());
    }

    // ✅ NOVO: lista registros por paciente
    @GetMapping("/patient/{pacienteId}")
    @Operation(summary = "Lista registros de circunferência por paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registros retornados com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID de paciente inválido"),
            @ApiResponse(responseCode = "404", description = "Nenhum registro encontrado para este paciente")
    })
    public ResponseEntity<List<DataCircleModel>> getByPatient(@PathVariable Integer pacienteId) {
        return ResponseEntity.ok(service.listarPorPaciente(pacienteId));
    }


    @PatchMapping("/patient/{pacienteId}")
    @Operation(summary = "Atualiza parcialmente dados de circunferência por paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito de rótulo para o paciente")
    })
    public ResponseEntity<DataCircleModel> atualizarParcialPorPaciente(
            @PathVariable Integer pacienteId,
            @RequestParam(name = "rotulo", required = false) String rotulo,
            @RequestBody Map<String, Object> updates) {

        DataCircleModel updated = service.atualizarParcialPorPaciente(pacienteId, updates, java.util.Optional.ofNullable(rotulo));
        return ResponseEntity.ok(updated);
    }


}
