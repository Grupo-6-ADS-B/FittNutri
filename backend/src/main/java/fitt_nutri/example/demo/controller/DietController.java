package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.DietAdapter;
import fitt_nutri.example.demo.dto.request.DietRequestDTO;
import fitt_nutri.example.demo.dto.response.DietResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/diets")
@RequiredArgsConstructor
@Tag(name = "Diets", description = "CRUD de dietas modelo com refeições e itens")
public class DietController {

    private final DietAdapter adapter;

    @GetMapping
    @Operation(summary = "Lista todas as dietas com paginação")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    public ResponseEntity<Page<DietResponseDTO>> getAll(
            @RequestParam(name = "page", defaultValue = "0") int page) {
        return ResponseEntity.ok(adapter.getAll(PageRequest.of(Math.max(page, 0), 10)));
    }

    @GetMapping("/search")
    @Operation(summary = "Busca dietas pelo nome")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Busca realizada com sucesso")
    })
    public ResponseEntity<Page<DietResponseDTO>> search(
            @RequestParam String nome,
            @RequestParam(name = "page", defaultValue = "0") int page) {
        return ResponseEntity.ok(adapter.search(nome, PageRequest.of(Math.max(page, 0), 10)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca dieta por ID com todas as refeições e itens")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dieta encontrada"),
            @ApiResponse(responseCode = "404", description = "Dieta não encontrada")
    })
    public ResponseEntity<DietResponseDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(adapter.getById(id));
    }

    @PostMapping
    @Operation(summary = "Cria uma nova dieta com refeições e itens")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Dieta criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<DietResponseDTO> create(@RequestBody @Valid DietRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adapter.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma dieta e suas refeições")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dieta atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Dieta não encontrada")
    })
    public ResponseEntity<DietResponseDTO> update(
            @PathVariable Integer id,
            @RequestBody @Valid DietRequestDTO dto) {
        return ResponseEntity.ok(adapter.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma dieta e todas as suas refeições")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Dieta removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Dieta não encontrada")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        adapter.delete(id);
        return ResponseEntity.noContent().build();
    }
}