package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService service;

    @PostMapping
    public ResponseEntity<MealResponseDTO> create(@RequestBody MealRequestDTO dto) {
        return ResponseEntity.ok(service.save(dto));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MealResponseDTO>> getByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getMealsByPatient(patientId));
    }

    @GetMapping("/patient/{patientId}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Integer patientId) throws Exception {
        byte[] pdf = service.generateDietPdf(patientId);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=dieta.pdf")
                .body(pdf);
    }
}

