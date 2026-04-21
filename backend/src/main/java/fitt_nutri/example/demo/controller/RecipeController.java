package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.RecipeAdapter;
import fitt_nutri.example.demo.dto.request.RecipeRequestDTO;
import fitt_nutri.example.demo.dto.response.RecipeResponseDTO;
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
@RequestMapping("/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipes", description = "CRUD de receitas com cálculo automático de macros")
public class RecipeController {

    private final RecipeAdapter adapter;

    @GetMapping
    @Operation(summary = "Lista todas as receitas com paginação")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    public ResponseEntity<Page<RecipeResponseDTO>> getAll(
            @RequestParam(name = "page", defaultValue = "0") int page) {
        return ResponseEntity.ok(adapter.getAll(PageRequest.of(Math.max(page, 0), 10)));
    }

    @GetMapping("/search")
    @Operation(summary = "Busca receitas pelo nome")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Busca realizada com sucesso")
    })
    public ResponseEntity<Page<RecipeResponseDTO>> search(
            @RequestParam String nome,
            @RequestParam(name = "page", defaultValue = "0") int page) {
        return ResponseEntity.ok(adapter.search(nome, PageRequest.of(Math.max(page, 0), 10)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca receita por ID com macros calculados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Receita encontrada"),
            @ApiResponse(responseCode = "404", description = "Receita não encontrada")
    })
    public ResponseEntity<RecipeResponseDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(adapter.getById(id));
    }

    @PostMapping
    @Operation(summary = "Cria uma nova receita com seus ingredientes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Receita criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<RecipeResponseDTO> create(@RequestBody @Valid RecipeRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adapter.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma receita e seus ingredientes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Receita atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Receita não encontrada")
    })
    public ResponseEntity<RecipeResponseDTO> update(
            @PathVariable Integer id,
            @RequestBody @Valid RecipeRequestDTO dto) {
        return ResponseEntity.ok(adapter.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma receita e seus ingredientes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Receita removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Receita não encontrada")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        adapter.delete(id);
        return ResponseEntity.noContent().build();
    }
}