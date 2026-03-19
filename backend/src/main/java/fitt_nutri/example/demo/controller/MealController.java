package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.domain.entity.Macros;
import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.domain.entity.MealItem;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealItemDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.response.MealItemResponseDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.dto.response.PatientMealsResponseDTO;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.service.MealService;
import fitt_nutri.example.demo.usecase.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meals")
@Tag(name = "Refeições", description = "CRUD de refeições")
@RequiredArgsConstructor
public class MealController {

    private final MealService service;

    private final CreateMealUseCase createMealUseCase;
    private final CalculateMealMacrosUseCase calculateMealMacrosUseCase;
    private final SaveFullDietUseCase saveFullDietUseCase;
    private final UpdateMealUseCase updateMealUseCase;
    private final PatchMealUseCase patchMealUseCase;
    private final DeleteMealUseCase deleteMealUseCase;
    private final GenerateDietPdfUseCase generateDietPdfUseCase;

    @Operation(summary = "Cria uma refeição (com vários alimentos) para um paciente")
    @ApiResponse(responseCode = "200", description = "Refeição criada com sucesso")
    @PostMapping("/meal-by-type/{patientId}")
    public ResponseEntity<Void> addMealByType(
            @PathVariable Integer patientId,
            @RequestBody MealRequestDTO request) {

        Meal meal = toDomain(request);
        createMealUseCase.execute(patientId, meal);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Calcula os macros totais de uma refeição (sem persistir)")
    @PostMapping("/calculate-macros")
    public ResponseEntity<MacrosDTO> calculateMealMacros(
            @RequestBody MealRequestDTO request) {

        Meal meal = toDomain(request);
        Macros macros = calculateMealMacrosUseCase.execute(meal);

        return ResponseEntity.ok(new MacrosDTO(
                macros.getProteina(),
                macros.getCarboidrato(),
                macros.getLipideos(),
                macros.getFibra(),
                macros.getKcal()
        ));
    }

    @Operation(summary = "Lista todas as refeições de um paciente")
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
            dto.setObservacao(meal.getObservacao());

            List<MealItemResponseDTO> itensDTO = meal.getAlimentos().stream().map(item -> {
                MealItemResponseDTO i = new MealItemResponseDTO();
                i.setId(item.getId());
                i.setAlimento(item.getAlimento());
                i.setQuantidade(item.getQuantidade());
                i.setUnidade(item.getUnidade());
                return i;
            }).collect(Collectors.toList());

            dto.setAlimentos(itensDTO);

            return dto;
        }).collect(Collectors.toList());

        response.setRefeicoes(refeicoesDTO);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Salva uma dieta completa para um paciente")
    @PostMapping("/full-diet/{patientId}")
    public ResponseEntity<Void> saveFullDiet(
            @PathVariable Integer patientId,
            @RequestBody FullDietRequestDTO request) {

        saveFullDietUseCase.execute(patientId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Atualiza uma refeição existente")
    @PutMapping("/{mealId}")
    public ResponseEntity<Void> updateMeal(
            @PathVariable Integer mealId,
            @RequestBody MealRequestDTO request) {

        Meal meal = toDomain(request);

        updateMealUseCase.execute(mealId, meal);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Atualiza parcialmente uma refeição existente")
    @PatchMapping("/{mealId}")
    public ResponseEntity<Void> patchMeal(
            @PathVariable Integer mealId,
            @RequestBody MealRequestDTO request) {

        Meal meal = toDomain(request);

        patchMealUseCase.execute(mealId, meal);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Deleta uma refeição existente")
    @DeleteMapping("/{mealId}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Integer mealId) {

        deleteMealUseCase.execute(mealId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Gera o PDF da dieta de um paciente")
    @GetMapping("/patient/{patientId}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Integer patientId) throws Exception {

        byte[] pdf = generateDietPdfUseCase.execute(patientId);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=dieta.pdf")
                .body(pdf);
    }

    private Meal toDomain(MealRequestDTO dto) {
        Meal m = new Meal();
        m.setDescricao(dto.getDescricao());
        m.setHorario(dto.getHorario());
        m.setObservacao(dto.getObservacao());

        if (dto.getAlimentos() != null) {
            List<MealItem> items = dto.getAlimentos().stream()
                    .map(this::toDomainItem)
                    .collect(Collectors.toList());
            m.setAlimentos(items);
        }

        return m;
    }

    private MealItem toDomainItem(MealItemDTO dto) {
        MealItem i = new MealItem();
        i.setAlimento(dto.getAlimento());
        i.setQuantidade(dto.getQuantidade());
        i.setUnidade(dto.getUnidade());
        return i;
    }
}