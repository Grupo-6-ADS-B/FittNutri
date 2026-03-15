package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.response.MealItemResponseDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.dto.response.PatientMealsResponseDTO;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.service.MealService;
import fitt_nutri.example.demo.service.PdfProducerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/meals")
@Tag(name = "Refeições", description = "CRUD de refeições")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NUTRI')")
public class MealController {

    private final MealService service;
    private final PdfProducerService pdfProducerService;

    @Operation(summary = "Solicita geração assíncrona do PDF via RabbitMQ")
    @ApiResponse(responseCode = "200", description = "Solicitação enviada para fila")
    @SecurityRequirement(name = "Bearer")
    @PostMapping("/patient/{patientId}/pdf/request")
    public ResponseEntity<String> requestPdf(
            @PathVariable Integer patientId,
            @RequestParam String patientName,
            @RequestParam Integer agendamentoId,
            @RequestParam String dataAgendamento) {
        pdfProducerService.requestPdfGeneration(patientId, patientName, agendamentoId, dataAgendamento);
        return ResponseEntity.ok("PDF sendo gerado e enviado para o S3!");
    }

    @Operation(summary = "Cria uma refeição (com vários alimentos) para um paciente")
    @ApiResponse(responseCode = "201", description = "Refeição criada com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @SecurityRequirement(name = "Bearer")
    @PostMapping("/meal-by-type/{patientId}")
    public ResponseEntity<MealResponseDTO> addMealByType(
            @PathVariable Integer patientId,
            @RequestBody MealRequestDTO request) {
        return ResponseEntity.status(201).body(service.addMealFromDto(patientId, request));
    }

    @Operation(summary = "Lista todas as refeições de um paciente com snapshots de macros")
    @ApiResponse(responseCode = "200", description = "Refeições retornadas com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @SecurityRequirement(name = "Bearer")
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
            List<MealItemResponseDTO> itensDTO = meal.getAlimentos().stream()
                    .map(item -> {
                        MealItemResponseDTO i = new MealItemResponseDTO();
                        i.setId(item.getId());
                        i.setAlimento(item.getAlimento());
                        i.setQuantidade(item.getQuantidade());
                        i.setUnidade(item.getUnidade());
                        i.setSnapshotKcal(item.getSnapshotKcal());
                        i.setSnapshotProteina(item.getSnapshotProteina());
                        i.setSnapshotCarboidrato(item.getSnapshotCarboidrato());
                        i.setSnapshotLipideos(item.getSnapshotLipideos());
                        i.setSnapshotFibra(item.getSnapshotFibra());
                        return i;
                    }).collect(Collectors.toList());
            dto.setAlimentos(itensDTO);
            return dto;
        }).collect(Collectors.toList());
        response.setRefeicoes(refeicoesDTO);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Salva uma dieta completa para um paciente (substitui a anterior)")
    @ApiResponse(responseCode = "200", description = "Dieta salva com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @SecurityRequirement(name = "Bearer")
    @PostMapping("/full-diet/{patientId}")
    public ResponseEntity<List<MealResponseDTO>> saveFullDiet(
            @PathVariable Integer patientId,
            @RequestBody FullDietRequestDTO request) {
        return ResponseEntity.ok(service.saveFullDiet(patientId, request));
    }

    @Operation(summary = "Atualiza uma refeição existente")
    @ApiResponse(responseCode = "200", description = "Refeição atualizada com sucesso")
    @ApiResponse(responseCode = "404", description = "Refeição não encontrada")
    @SecurityRequirement(name = "Bearer")
    @PutMapping("/{mealId}")
    public ResponseEntity<MealModel> updateMeal(
            @PathVariable Integer mealId,
            @RequestBody MealModel meal) {
        return ResponseEntity.ok(service.updateMeal(mealId, meal));
    }

    @Operation(summary = "Atualiza parcialmente uma refeição existente")
    @ApiResponse(responseCode = "200", description = "Refeição atualizada com sucesso")
    @ApiResponse(responseCode = "404", description = "Refeição não encontrada")
    @SecurityRequirement(name = "Bearer")
    @PatchMapping("/{mealId}")
    public ResponseEntity<MealModel> patchMeal(
            @PathVariable Integer mealId,
            @RequestBody MealModel mealPatch) {
        return ResponseEntity.ok(service.patchMeal(mealId, mealPatch));
    }

    @Operation(summary = "Deleta uma refeição existente")
    @ApiResponse(responseCode = "204", description = "Refeição deletada com sucesso")
    @ApiResponse(responseCode = "404", description = "Refeição não encontrada")
    @SecurityRequirement(name = "Bearer")
    @DeleteMapping("/{mealId}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Integer mealId) {
        service.deleteMeal(mealId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Gera o PDF da dieta de um paciente")
    @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @SecurityRequirement(name = "Bearer")
    @GetMapping("/patient/{patientId}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Integer patientId) throws Exception {
        byte[] pdf = service.generateDietPdf(patientId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=dieta.pdf")
                .body(pdf);
    }
}
