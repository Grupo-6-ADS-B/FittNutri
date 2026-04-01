package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
import fitt_nutri.example.demo.dto.response.SchedulingResponseDTO;
import fitt_nutri.example.demo.service.SchedulingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedulings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Tag(name = "Agendamentos", description = "CRUD de agendamentos")
public class SchedulingController {

    private final SchedulingService service;

    @PostMapping
    @Operation(summary = "Cria um agendamento")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Agendamento criado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente ou nutricionista não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> create(@Valid @RequestBody SchedulingRequestDTO dto) {
        return ResponseEntity.status(201).body(service.createAndReturn(dto));
    }

    @GetMapping
    @Operation(summary = "Lista todos os agendamentos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada")
    })
    public ResponseEntity<List<SchedulingResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAllAndReturn());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca agendamento por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Agendamento encontrado"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getByIdAndReturn(id));
    }

    @GetMapping("/patient/{pacienteId}")
    @Operation(summary = "Lista agendamentos de um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    public ResponseEntity<List<SchedulingResponseDTO>> getByPatient(@PathVariable Integer pacienteId) {
        return ResponseEntity.ok(service.getByPatientAndReturn(pacienteId));
    }

    @GetMapping("/nutritionist/{usuarioId}")
    @Operation(summary = "Lista agendamentos de um nutricionista (paginado para infinite scroll)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada"),
            @ApiResponse(responseCode = "404", description = "Nutricionista não encontrado")
    })
    public ResponseEntity<Page<SchedulingResponseDTO>> getByNutritionist(
            @PathVariable Integer usuarioId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        var pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return ResponseEntity.ok(service.getByNutritionistAndReturn(usuarioId, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza agendamento por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Agendamento atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> update(@PathVariable Integer id, @Valid @RequestBody SchedulingRequestDTO dto) {
        return ResponseEntity.ok(service.updateAndReturn(id, dto));
    }

    @PatchMapping("/{id}/date")
    @Operation(summary = "Atualiza apenas a data de um agendamento")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Data atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> updateDate(@PathVariable Integer id, @RequestBody LocalDate newDate) {
        return ResponseEntity.ok(service.updateDateAndReturn(id, newDate));
    }

    @PatchMapping("/{id}/observacoes")
    @Operation(summary = "Atualiza apenas as observações de um agendamento")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Observações atualizadas com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> updateObservacoes(@PathVariable Integer id, @RequestBody String observacoes) {
        return ResponseEntity.ok(service.updateObservacoeseAndReturn(id, observacoes));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui agendamento por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Agendamento excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteScheduling(id);
        return ResponseEntity.noContent().build();
    }
}
