package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.FormAdapter;
import fitt_nutri.example.demo.dto.request.FormRequestDTO;
import fitt_nutri.example.demo.dto.response.FormResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/forms")
@Tag(name = "Formulários", description = "CRUD de formulários")
@RequiredArgsConstructor
public class FormController {

    private final FormAdapter formAdapter;

    @Operation(summary = "Cria um formulário")
    @ApiResponse(responseCode = "201", description = "Formulário criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Parâmetros inválidos")
    @PostMapping
    public ResponseEntity<FormResponseDTO> createForm(@Valid @RequestBody FormRequestDTO dto) {
        FormResponseDTO created = formAdapter.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @Operation(summary = "Lista todos os formulários")
    @ApiResponse(responseCode = "200", description = "Formulários retornados com sucesso")
    @ApiResponse(responseCode = "204", description = "Nenhum formulário encontrado")
    @GetMapping
    public ResponseEntity<List<FormResponseDTO>> getAllForms() {
        List<FormResponseDTO> forms = formAdapter.getAll();
        if (forms.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(forms);
    }

    @Operation(summary = "Busca um formulário por id")
    @ApiResponse(responseCode = "200", description = "Formulário encontrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Formulário não encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<FormResponseDTO> getFormById(@PathVariable Integer id) {
        try {
            FormResponseDTO form = formAdapter.getById(id);
            return ResponseEntity.ok(form);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Atualiza um formulário por id")
    @ApiResponse(responseCode = "200", description = "Formulário atualizado com sucesso")
    @ApiResponse(responseCode = "400", description = "Parâmetros inválidos")
    @ApiResponse(responseCode = "404", description = "Formulário não encontrado")
    @PutMapping("/{id}")
    public ResponseEntity<FormResponseDTO> updateForm(@PathVariable Integer id,
                                                      @Valid @RequestBody FormRequestDTO dto) {
        try {
            FormResponseDTO updated = formAdapter.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.notFound().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
    }

    @Operation(summary = "Deleta um formulário por id")
    @ApiResponse(responseCode = "204", description = "Formulário deletado com sucesso")
    @ApiResponse(responseCode = "404", description = "Formulário não encontrado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable Integer id) {
        try {
            formAdapter.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
