package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.exceptions.AlreadyExistingData;
import fitt_nutri.example.demo.exceptions.NotFoundData;
import fitt_nutri.example.demo.exceptions.InvalidRequest;
import fitt_nutri.example.demo.exceptions.NotFoundUser;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.service.AnthropometricDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/anthropometric-data")
@AllArgsConstructor
@Tag(name ="Dados Antropometricos" , description = "CRUD para gerenciar os dados antropometricos")
public class AnthropometricDataController {

    private final AnthropometricDataService service;

    @Operation(summary = "Lista todos os dados antropométricos")
    @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum dado encontrado")
    @GetMapping
    public ResponseEntity<List<AnthropometricDataModel>> getAll() {
        try {
            List<AnthropometricDataModel> dados = service.listAll();
            return ResponseEntity.ok(dados);
        } catch (NotFoundUser ex) {
            return ResponseEntity.status(404).build();
        }
    }

    @Operation(summary = "Busca dados antropométricos por ID")
    @ApiResponse(responseCode = "200", description = "Dado encontrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<AnthropometricDataModel> getById(@PathVariable Integer id) {
        try {
            AnthropometricDataModel dado = service.getById(id);
            return ResponseEntity.ok(dado);
        } catch (NotFoundUser ex) {
            return ResponseEntity.status(404).build();
        }
    }

    @Operation(summary = "Cadastra novos dados antropométricos")
    @ApiResponse(responseCode = "201", description = "Dados cadastrados com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou ausentes")
    @ApiResponse(responseCode = "409", description = "ID já existente no sistema")
    @PostMapping
    public ResponseEntity<AnthropometricDataModel> create(@Valid @RequestBody AnthropometricDataModel dados) {
        try {
            AnthropometricDataModel criado = service.create(dados);
            return ResponseEntity.status(201).body(criado);
        } catch (AlreadyExistingData ex) {
            return ResponseEntity.status(409).build();
        } catch (NotFoundData ex) {
            return ResponseEntity.status(400).build();
        }
    }

    @Operation(summary = "Atualiza dados antropométricos por ID")
    @ApiResponse(responseCode = "200", description = "Dados atualizados com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    @PutMapping("/{id}")
    public ResponseEntity<AnthropometricDataModel> update(@PathVariable Integer id, @RequestBody AnthropometricDataModel dados) {
        try {
            dados.setIdDadosAntropometricos(id);
            AnthropometricDataModel atualizado = service.update(dados);
            return ResponseEntity.ok(atualizado);
        } catch (NotFoundData ex) {
            return ResponseEntity.status(404).build();
        } catch (AlreadyExistingData ex) {
            return ResponseEntity.status(409).build();
        }
    }

    @Operation(summary = "Atualiza parcialmente dados antropométricos por ID")
    @ApiResponse(responseCode = "200", description = "Dados atualizados parcialmente com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    @PatchMapping("/{id}")
    public ResponseEntity<AnthropometricDataModel> partialUpdate(@PathVariable Integer id, @RequestBody Map<String, Object> fields) {
        try {
            AnthropometricDataModel atualizado = service.partialUpdate(id, fields);
            return ResponseEntity.ok(atualizado);
        } catch (NotFoundData ex) {
            return ResponseEntity.status(404).build();
        } catch (InvalidRequest ex) {
            return ResponseEntity.status(400).build();
        }
    }

    @Operation(summary = "Exclui dados antropométricos por ID")
    @ApiResponse(responseCode = "204", description = "Dados deletados com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        try {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (NotFoundUser ex) {
            return ResponseEntity.status(404).build();
        } catch (InvalidRequest ex) {
            return ResponseEntity.status(400).build();
        }
    }

    @Operation(summary = "Busca dados antropométricos por ID do paciente")
    @ApiResponse(responseCode = "200", description = "Dados encontrados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum dado encontrado para o paciente informado")
    @PatchMapping("/paciente/{pacienteId}")
    public ResponseEntity<?> partialUpdateByPacienteId(
            @PathVariable Integer pacienteId,
            @RequestBody Map<String, Object> fields) {
        try {
            AnthropometricDataModel updatedData = service.partialUpdateByPacienteId(pacienteId, fields);
            return ResponseEntity.ok(updatedData);
        } catch (NotFoundData e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao atualizar parcialmente os dados do paciente: " + e.getMessage());
        }
    }

    @Operation(summary = "Lista todos os dados antropométricos de um paciente")
    @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum dado encontrado para o paciente")
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<?> listByPacienteId(@PathVariable Integer pacienteId) {
        try {
            List<AnthropometricDataModel> dados = service.findByPaciente_Id(pacienteId);
            return ResponseEntity.ok(dados);
        } catch (NotFoundData ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao buscar os dados do paciente: " + ex.getMessage());
        }
    }
}