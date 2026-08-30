package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.EvolucaoPacienteDTO;
import fitt_nutri.example.demo.dto.request.ConsultaPacienteRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientHistoryResponseDTO;
import fitt_nutri.example.demo.service.BioimpedancePdfService;
import fitt_nutri.example.demo.service.PatientHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient-history")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NUTRI')")
@Tag(name = "Histórico de paciente", description = "CRUD de histórico de consultas dos pacientes")
public class PatientHistoryController {

    private final PatientHistoryService service;
    private final BioimpedancePdfService bioimpedancePdfService;

    @Operation(summary = "Buscar histórico de consultas de um paciente pelo ID do paciente")
    @ApiResponse(responseCode = "200", description = "Histórico de consultas retornado com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<List<PatientHistoryResponseDTO>> buscarPorPaciente(@PathVariable Integer id) {
        return ResponseEntity.ok(service.listarPorPaciente(id));
    }

    @Operation(summary = "Salvar uma nova consulta para um paciente")
    @ApiResponse(responseCode = "200", description = "Consulta salva com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @PostMapping("/{pacienteId}")
    public ResponseEntity<Void> salvarConsulta(
            @PathVariable Integer pacienteId,
            @RequestBody ConsultaPacienteRequestDTO dto
    ) {
        service.salvarConsulta(pacienteId, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Gerar PDF do relatório de bioimpedância do paciente")
    @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente ou dados não encontrados")
    @GetMapping("/{pacienteId}/pdf-bioimpedancia")
    public ResponseEntity<byte[]> getBioimpedancePdf(
            @PathVariable Integer pacienteId
    ) throws Exception {
        byte[] pdf = bioimpedancePdfService.generateBioimpedancePdf(pacienteId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=bioimpedancia.pdf")
                .body(pdf);
    }

    @Operation(summary = "Buscar evolução do paciente em um período específico")
    @ApiResponse(responseCode = "200", description = "Evolução do paciente retornada com sucesso")
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    @GetMapping("/evolucao/{pacienteId}")
    public ResponseEntity<Page<EvolucaoPacienteDTO>> buscarEvolucaoPorPeriodo(
            @PathVariable Integer pacienteId,
            @RequestParam String dataInicio,
            @RequestParam String dataFim,
            @RequestParam(name = "page", defaultValue = "0") int page
    ) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), 10);
        return ResponseEntity.ok(
                service.buscarEvolucaoPorPeriodo(pacienteId, dataInicio, dataFim, pageable)
        );
    }




}
