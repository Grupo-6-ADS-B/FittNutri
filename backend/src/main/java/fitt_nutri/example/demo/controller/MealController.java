package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.dto.response.PatientMealsResponseDTO;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.service.MealService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meals")
@Tag(name = "Refeições", description = "CRUD de refeições")
@RequiredArgsConstructor
public class MealController {

    private final MealService service;

    @Operation(summary = "Cria uma refeição por tipo de refeicao para um paciente")
    @ApiResponse(responseCode = "200", description = "Refeição criada com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @PostMapping("/meal-by-type/{patientId}")
    public ResponseEntity<List<MealModel>> addMealByType(
            @PathVariable Integer patientId,
            @RequestBody MealRequestDTO request) {

        List<MealModel> meals = request.getAlimentos().stream().map(item -> {
            MealModel meal = new MealModel();
            meal.setDescricao(request.getDescricao());
            meal.setHorario(request.getHorario());
            meal.setAlimento(item.getAlimento());
            meal.setQuantidade(item.getQuantidade());
            meal.setUnidade(item.getUnidade());
            meal.setObservacao(request.getObservacao());
            return service.addMeal(patientId, meal);
        }).toList();

        return ResponseEntity.ok(meals);
    }

    @Operation(summary = "Lista todas as refeições de um paciente")
    @ApiResponse(responseCode = "200", description = "Refeições retornadas com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @GetMapping("/{patientId}")
    public ResponseEntity<PatientMealsResponseDTO> getMealsByPatient(@PathVariable Integer patientId) {

        List<MealModel> meals = service.getAllMealsByPatient(patientId);

        PatientMealsResponseDTO response = new PatientMealsResponseDTO();
        response.setId(patientId);

        List<MealResponseDTO> refeicoesDTO = meals.stream().map(meal -> {
            MealResponseDTO dto = new MealResponseDTO();
            dto.setId(meal.getId());
            dto.setHorario(meal.getHorario());
            dto.setDescricao(meal.getDescricao());
            dto.setAlimento(meal.getAlimento());
            dto.setQuantidade(meal.getQuantidade());
            dto.setUnidade(meal.getUnidade());
            dto.setObservacao(meal.getObservacao());
            return dto;
        }).toList();

        response.setRefeicoes(refeicoesDTO);

        return ResponseEntity.ok(response);
    }


    @Operation(summary = "Salva uma dieta completa para um paciente")
    @ApiResponse(responseCode = "200", description = "Dieta salva com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @PostMapping("/full-diet/{patientId}")
    public ResponseEntity<List<MealModel>> saveFullDiet(
            @PathVariable Integer patientId,
            @RequestBody FullDietRequestDTO request) {

        List<MealModel> meals = request.getRefeicoes().stream().map(item -> {
            MealModel meal = new MealModel();
            meal.setHorario(item.getHorario());
            meal.setDescricao(item.getDescricao());
            meal.setAlimento(item.getAlimento());
            meal.setQuantidade(item.getQuantidade());
            meal.setUnidade(item.getUnidade());
            meal.setObservacao(item.getObservacao());
            return meal;
        }).toList();

        return ResponseEntity.ok(service.saveFullDiet(patientId, meals));
    }


    @Operation(summary = "Atualiza uma refeição existente")
    @ApiResponse(responseCode = "200", description = "Refeição atualizada com sucesso")
    @ApiResponse(responseCode = "404", description = "Refeição não encontrada")
    @PutMapping("/{mealId}")
    public ResponseEntity<MealModel> updateMeal(@PathVariable Integer mealId, @RequestBody MealModel meal) {
        MealModel updatedMeal = service.updateMeal(mealId, meal);
        return ResponseEntity.ok(updatedMeal);
    }

    @Operation(summary = "Deleta uma refeição existente")
    @ApiResponse(responseCode = "204", description = "Refeição deletada com sucesso")
    @ApiResponse(responseCode = "404", description = "Refeição não encontrada")
    @DeleteMapping("/{mealId}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Integer mealId) {
        service.deleteMeal(mealId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Atualiza parcialmente uma refeição existente")
    @ApiResponse(responseCode = "200", description = "Refeição atualizada com sucesso")
    @ApiResponse(responseCode = "404", description = "Refeição não encontrada")
    @PatchMapping("/{mealId}")
    public ResponseEntity<MealModel> patchMeal(@PathVariable Integer mealId, @RequestBody MealModel mealPatch) {
        MealModel updatedMeal = service.patchMeal(mealId, mealPatch);
        return ResponseEntity.ok(updatedMeal);
    }

    @Operation(summary = "Gera o PDF da dieta de um paciente")
    @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @GetMapping("/patient/{patientId}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Integer patientId) throws Exception {
        byte[] pdf = service.generateDietPdf(patientId);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=dieta.pdf")
                .body(pdf);
    }





}

