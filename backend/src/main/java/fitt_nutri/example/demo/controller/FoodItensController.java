package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.dto.request.FoodItensRequestDTO;
import fitt_nutri.example.demo.dto.response.FoodItensResponseDTO;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.service.FoodItensService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/food-itens")
@RequiredArgsConstructor
@Tag(name = "Alimentos", description = "Consulta de alimentos TACO e gerenciamento de alimentos customizados")
public class FoodItensController {

    private final FoodItensService service;

    // -------------------------------------------------------------------------
    // Leitura — alimentos TACO (banco público)
    // -------------------------------------------------------------------------

    @GetMapping
    @Operation(summary = "Lista todos os alimentos (TACO + custom do nutricionista logado)")
    @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum dado encontrado")
    public ResponseEntity<Page<FoodItensModel>> getFoodItems(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        Page<FoodItensModel> result = service.findAll(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    @Operation(summary = "Busca alimento por nome e retorna valores escalados pela quantidade em gramas")
    @ApiResponse(responseCode = "200", description = "Dado encontrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<FoodItensModel> getFoodItemByNameAndAmount(
            @RequestParam String nome,
            @RequestParam double quantidadeEmGramas
    ) throws BadRequestException {
        return ResponseEntity.ok(service.findByName(nome, quantidadeEmGramas));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca alimento por ID")
    @ApiResponse(responseCode = "200", description = "Dado encontrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<FoodItensModel> getFoodItemById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getFoodItemById(id));
    }

    @GetMapping("/calorias/{nome}")
    @Operation(summary = "Retorna as calorias calculadas de um alimento pela quantidade em gramas")
    @ApiResponse(responseCode = "200", description = "Calorias calculadas com sucesso")
    @ApiResponse(responseCode = "400", description = "Quantidade inválida")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<Double> getCalorias(
            @PathVariable String nome,
            @RequestParam Double gramas
    ) throws BadRequestException {
        return ResponseEntity.ok(service.getCaloriasByNomeAndGramas(nome, gramas));
    }

    @GetMapping("/macros/{nome}")
    @Operation(summary = "Retorna os macros de um alimento pela quantidade em gramas")
    @ApiResponse(responseCode = "200", description = "Macros retornados com sucesso")
    @ApiResponse(responseCode = "400", description = "Quantidade inválida")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<MacrosDTO> getMacros(
            @PathVariable String nome,
            @RequestParam Double gramas
    ) throws BadRequestException {
        return ResponseEntity.ok(service.getMacrosByNome(nome, gramas));
    }

    @GetMapping("/search-part")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Busca alimentos por parte do nome — retorna TACO + custom do nutricionista logado")
    @ApiResponse(responseCode = "200", description = "Dados encontrados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum alimento encontrado")
    public ResponseEntity<List<FoodItensResponseDTO>> getFoodItemsByNamePart(
            @RequestParam String nomeParte
    ) {
        return ResponseEntity.ok(service.findFoodsByNamePart(nomeParte));
    }

    // -------------------------------------------------------------------------
    // CRUD de alimentos customizados (Fase 2)
    // -------------------------------------------------------------------------

    @PostMapping("/custom")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Cria um alimento personalizado para o nutricionista logado")
    @ApiResponse(responseCode = "201", description = "Alimento criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    public ResponseEntity<FoodItensResponseDTO> criarCustom(
            @Valid @RequestBody FoodItensRequestDTO dto
    ) {
        return ResponseEntity.status(201).body(service.criarCustom(dto));
    }

    @GetMapping("/custom")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Lista os alimentos customizados do nutricionista logado")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @ApiResponse(responseCode = "204", description = "Nenhum alimento customizado cadastrado")
    public ResponseEntity<List<FoodItensResponseDTO>> listarMeusAlimentos() {
        List<FoodItensResponseDTO> lista = service.listarMeusAlimentos();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/custom/{id}")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Atualiza completamente um alimento customizado do nutricionista logado")
    @ApiResponse(responseCode = "200", description = "Alimento atualizado com sucesso")
    @ApiResponse(responseCode = "403", description = "Sem permissão para editar este alimento")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<FoodItensResponseDTO> atualizarCustom(
            @PathVariable Integer id,
            @Valid @RequestBody FoodItensRequestDTO dto
    ) {
        return ResponseEntity.ok(service.atualizarCustom(id, dto));
    }

    @PatchMapping("/custom/{id}")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Atualiza parcialmente um alimento customizado do nutricionista logado")
    @ApiResponse(responseCode = "200", description = "Alimento atualizado com sucesso")
    @ApiResponse(responseCode = "400", description = "Campo inválido")
    @ApiResponse(responseCode = "403", description = "Sem permissão para editar este alimento")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<FoodItensResponseDTO> atualizarParcialCustom(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> campos
    ) {
        return ResponseEntity.ok(service.atualizarParcialCustom(id, campos));
    }

    @DeleteMapping("/custom/{id}")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Remove um alimento customizado do nutricionista logado")
    @ApiResponse(responseCode = "204", description = "Alimento removido com sucesso")
    @ApiResponse(responseCode = "403", description = "Sem permissão para remover este alimento")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<Void> deletarCustom(@PathVariable Integer id) {
        service.deletarCustom(id);
        return ResponseEntity.noContent().build();
    }
}
