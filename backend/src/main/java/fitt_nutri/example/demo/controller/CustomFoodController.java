package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.CustomFoodAdapter;
import fitt_nutri.example.demo.dto.request.CustomFoodRequestDTO;
import fitt_nutri.example.demo.dto.response.CustomFoodResponseDTO;
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
@RequestMapping("/custom-foods")
@RequiredArgsConstructor
@Tag(name = "Custom Foods", description = "CRUD de alimentos customizados para receitas")
public class CustomFoodController {

    private final CustomFoodAdapter adapter;

    @GetMapping
    @Operation(summary = "Lista todos os alimentos customizados com paginação")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    public ResponseEntity<Page<CustomFoodResponseDTO>> getAll(
            @RequestParam(name = "page", defaultValue = "0") int page) {
        return ResponseEntity.ok(adapter.getAll(PageRequest.of(Math.max(page, 0), 20)));
    }

    @GetMapping("/search")
    @Operation(summary = "Busca alimentos customizados pelo nome")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Busca realizada com sucesso")
    })
    public ResponseEntity<Page<CustomFoodResponseDTO>> search(
            @RequestParam String nome,
            @RequestParam(name = "page", defaultValue = "0") int page) {
        return ResponseEntity.ok(adapter.search(nome, PageRequest.of(Math.max(page, 0), 20)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca alimento customizado por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Alimento encontrado"),
            @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    })
    public ResponseEntity<CustomFoodResponseDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(adapter.getById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo alimento customizado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Alimento criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<CustomFoodResponseDTO> create(@RequestBody @Valid CustomFoodRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adapter.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um alimento customizado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Alimento atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    })
    public ResponseEntity<CustomFoodResponseDTO> update(
            @PathVariable Integer id,
            @RequestBody @Valid CustomFoodRequestDTO dto) {
        return ResponseEntity.ok(adapter.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um alimento customizado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Alimento removido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        adapter.delete(id);
        return ResponseEntity.noContent().build();
    }
}