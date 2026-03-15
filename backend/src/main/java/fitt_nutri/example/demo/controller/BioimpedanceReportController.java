package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.service.BioimpedanceReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@Tag(name = "Relatórios", description = "Geração de relatórios em PDF")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NUTRI')")
public class BioimpedanceReportController {

    private final BioimpedanceReportService reportService;

    @Operation(summary = "Gera o PDF do relatório de bioimpedância de um paciente")
    @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente ou dados não encontrados")
    @SecurityRequirement(name = "Bearer")
    @GetMapping("/patient/{patientId}/bioimpedance/pdf")
    public ResponseEntity<byte[]> getBioimpedanceReport(@PathVariable Integer patientId) throws Exception {
        byte[] pdf = reportService.generateBioimpedanceReport(patientId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=relatorio-bioimpedancia.pdf")
                .body(pdf);
    }
}
