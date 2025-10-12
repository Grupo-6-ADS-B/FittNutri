package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import fitt_nutri.example.demo.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/patients")
@RestController
@RequiredArgsConstructor
@Tag(name = "Pacientes", description = "CRUD de pacientes")
public class PatientController {

    private final PatientService service;

    @PostMapping
    @Operation(summary = "Cria um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Paciente criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "Email, CPF ou nome já cadastrado")
    })
    public ResponseEntity<PatientResponseDTO> createPatient(@Valid @RequestBody PatientRequestDTO request) {
        return ResponseEntity.status(201).body(service.createPatient(request));
    }

    @GetMapping
    @Operation(summary = "Lista todos os pacientes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pacientes retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum paciente encontrado")
    })
    public ResponseEntity<List<PatientResponseDTO>> getAllPatients() {
        return ResponseEntity.status(200).body(service.getAllPatients());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca paciente por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente encontrado"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable Integer id) {
        return ResponseEntity.status(200).body(service.getPatientById(id));

    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza paciente por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado"),
            @ApiResponse(responseCode = "409", description = "Já existe paciente com esse email, cpf ou nome")
    })
    public  ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable Integer id, @Valid @RequestBody PatientRequestDTO request) {
        return ResponseEntity.status(200).body(service.updatePatient(id, request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente os dados de um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito de dados (email ou CPF já cadastrados)")
    })
    public ResponseEntity<PatientResponseDTO> patchPatient(
            @PathVariable Integer id,
           @Valid @RequestBody Map<String, Object> dto
    ) {
        return ResponseEntity.status(200).body(service.patchPatient(id, dto));
    }

    @DeleteMapping({"/{id}"})
    @Operation(summary = "Exclui um paciente por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Paciente excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        service.deletePatient(id);
        return ResponseEntity.status(200).build();

    }

}
