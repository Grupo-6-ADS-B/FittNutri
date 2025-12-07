package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.MealRequestDTO;
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
            meal.setHorario(item.getHorario());
            meal.setAlimento(item.getAlimento());
            meal.setQuantidade(item.getQuantidade());
            meal.setUnidade(item.getUnidade());
            meal.setObservacao(item.getObservacao());
            return service.addMeal(patientId, meal);
        }).toList();

        return ResponseEntity.ok(meals);
    }

    @Operation(summary = "Lista todas as refeições de um paciente")
    @ApiResponse(responseCode = "200", description = "Refeições retornadas com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @GetMapping("/{patientId}")
    public ResponseEntity<List<MealModel>> getMealsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getAllMealsByPatient(patientId));
    }

    @Operation(summary = "Salva uma dieta completa para um paciente")
    @ApiResponse(responseCode = "200", description = "Dieta salva com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @PostMapping("/full-diet/{patientId}")
    public ResponseEntity<List<MealModel>> saveFullDiet(@PathVariable Integer patientId, @RequestBody List<MealModel> meals) {
        return ResponseEntity.ok(service.saveFullDiet(patientId, meals));
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

