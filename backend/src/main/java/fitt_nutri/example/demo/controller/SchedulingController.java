package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.SchedulingAdapter;
import fitt_nutri.example.demo.dto.request.SchedulingRequestDTO;
import fitt_nutri.example.demo.dto.response.SchedulingResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedulings")
@CrossOrigin(origins = "http://localhost:5500")
@RequiredArgsConstructor
@Tag(name = "Agendamentos", description = "CRUD de agendamentos")
public class SchedulingController {

    private final SchedulingAdapter adapter;

    @PostMapping
    @Operation(summary = "Cria um agendamento")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Agendamento criado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente ou nutricionista não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> create(@Valid @RequestBody SchedulingRequestDTO dto) {
        return ResponseEntity.status(201).body(adapter.create(dto));
    }

    @GetMapping
    @Operation(summary = "Lista todos os agendamentos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada")
    })
    public ResponseEntity<List<SchedulingResponseDTO>> getAll() {
        return ResponseEntity.ok(adapter.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca agendamento por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Agendamento encontrado"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(adapter.getById(id));
    }

    @GetMapping("/patient/{pacienteId}")
    @Operation(summary = "Lista agendamentos de um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    public ResponseEntity<List<SchedulingResponseDTO>> getByPatient(@PathVariable Integer pacienteId) {
        return ResponseEntity.ok(adapter.getByPatient(pacienteId));
    }

    @GetMapping("/nutritionist/{usuarioId}")
    @Operation(summary = "Lista agendamentos de um nutricionista")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada"),
            @ApiResponse(responseCode = "404", description = "Nutricionista não encontrado")
    })
    public ResponseEntity<List<SchedulingResponseDTO>> getByNutritionist(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(adapter.getByNutritionist(usuarioId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza agendamento por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Agendamento atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> update(@PathVariable Integer id, @Valid @RequestBody SchedulingRequestDTO dto) {
        return ResponseEntity.ok(adapter.update(id, dto));
    }

    @PatchMapping("/{id}/date")
    @Operation(summary = "Atualiza apenas a data de um agendamento")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Data atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> updateDate(@PathVariable Integer id, @RequestBody LocalDate newDate) {
        return ResponseEntity.ok(adapter.updateDate(id, newDate));
    }

    @PatchMapping("/{id}/observacoes")
    @Operation(summary = "Atualiza apenas as observações de um agendamento")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Observações atualizadas com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<SchedulingResponseDTO> updateObservacoes(@PathVariable Integer id, @RequestBody String observacoes) {
        return ResponseEntity.ok(adapter.updateObservacoes(id, observacoes));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui agendamento por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Agendamento excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        adapter.delete(id);
        return ResponseEntity.noContent().build();
    }
}
