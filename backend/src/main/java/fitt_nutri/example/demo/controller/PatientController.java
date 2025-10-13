package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.PatientAdapter;
import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Endpoints para gerenciamento de pacientes")
public class PatientController {

    private final PatientAdapter adapter;

    @PostMapping
    @Operation(summary = "Cria um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Paciente criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "Conflito de dados (Email, CPF ou Nome já cadastrado)")
    })
    public ResponseEntity<PatientResponseDTO> createPatient(@RequestBody PatientRequestDTO dto) {
        PatientResponseDTO response = adapter.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista todos os pacientes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pacientes retornada"),
            @ApiResponse(responseCode = "404", description = "Nenhum paciente cadastrado")
    })
    public ResponseEntity<List<PatientResponseDTO>> getAllPatients() {
        List<PatientResponseDTO> response = adapter.getAll();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca paciente por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente encontrado"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable Integer id) {
        PatientResponseDTO response = adapter.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito de dados (Email, CPF ou Nome já cadastrado)")
    })
    public ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable Integer id,
                                                            @RequestBody PatientRequestDTO dto) {
        PatientResponseDTO response = adapter.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito de dados (Email, CPF ou Nome já cadastrado)")
    })
    public ResponseEntity<PatientResponseDTO> patchPatient(@PathVariable Integer id,
                                                           @RequestBody Map<String, Object> updates) {
        PatientResponseDTO response = adapter.patch(id, updates);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Paciente excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado")
    })
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        adapter.delete(id);
        return ResponseEntity.noContent().build();
    }
}
