package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.service.FoodItensService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/food-itens")
@RequiredArgsConstructor
@Tag(name = "Alimentos", description = "CRUD para gerenciar os alimentos")
public class FoodItensController {

    private final FoodItensService service;

    @GetMapping
    @Operation(summary = "Lista todos os alimentos")
    @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum dado encontrado")
    public ResponseEntity<List<FoodItensModel>> getAllFoodItems() {
        List<FoodItensModel> foodItems = service.getAllFoodItems();
        if (foodItems.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foodItems);
    }

    @GetMapping("/search")
    @Operation(summary = "Busca alimento por nome e quantidade em gramas")
    @ApiResponse(responseCode = "200", description = "Dado encontrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o nome fornecido não encontrado")
    public ResponseEntity<FoodItensModel> getFoodItemByNameAndAmount(
            @RequestParam String nome,
            @RequestParam double quantidadeEmGramas
    ) throws BadRequestException {
        FoodItensModel foodItem = service.findByName(nome, quantidadeEmGramas);
        if (foodItem == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foodItem);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca alimento por ID")
    @ApiResponse(responseCode = "200", description = "Dado encontrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    public ResponseEntity<FoodItensModel> getFoodItemById(@PathVariable Integer id) {
        FoodItensModel foodItem = service.getFoodItemById(id);
        if (foodItem == null || foodItem.getId() == 0){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foodItem);
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

        Double calorias = service.getCaloriasByNomeAndGramas(nome, gramas);

        return ResponseEntity.ok(calorias);
    }

    @GetMapping("/macros/{nome}")
    @Operation(summary = "Retorna apenas os macros de um alimento pela quantidade em gramas")
    @ApiResponse(responseCode = "200", description = "Macros retornados com sucesso")
    @ApiResponse(responseCode = "400", description = "Quantidade inválida")
    @ApiResponse(responseCode = "404", description = "Alimento não encontrado")
    public ResponseEntity<MacrosDTO> getMacros(
            @PathVariable String nome,
            @RequestParam Double gramas
    ) throws BadRequestException {

        MacrosDTO macros = service.getMacrosByNome(nome, gramas);

        return ResponseEntity.ok(macros);
    }

    @GetMapping("/search-part")
    @Operation(summary = "Busca alimentos por parte do nome")
    @ApiResponse(responseCode = "200", description = "Dados encontrados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum alimento encontrado")
    public ResponseEntity<List<FoodItensModel>> getFoodItemsByNamePart(
            @RequestParam String nomeParte
    ) {
        try {
            List<FoodItensModel> resultados = service.findFoodsByNamePart(nomeParte);
            return ResponseEntity.ok(resultados);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }






}
