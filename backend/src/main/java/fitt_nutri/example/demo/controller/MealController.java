package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.service.MealService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService service;

    @Operation(summary = "Cria uma refeição para um paciente")
    @ApiResponse(responseCode = "200", description = "Refeição criada com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @PostMapping
    public ResponseEntity<MealResponseDTO> create(@RequestBody MealRequestDTO dto) {
        return ResponseEntity.ok(service.save(dto));
    }

    @Operation(summary = "Lista todas as refeições de um paciente")
    @ApiResponse(responseCode = "200", description = "Refeições retornadas com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MealResponseDTO>> getByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getMealsByPatient(patientId));
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

