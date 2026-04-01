package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import fitt_nutri.example.demo.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "CRUD de pacientes")
public class PatientController {

    private final PatientService service;

    @PostMapping
    @Operation(summary = "Cria um paciente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Paciente criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "Conflito de dados (Email, CPF ou Nome já cadastrado)")
    })
    public ResponseEntity<PatientResponseDTO> createPatient(@RequestBody PatientRequestDTO dto) {
        PatientResponseDTO response = service.createAndReturn(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista todos os pacientes do nutricionista logado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pacientes retornada"),
            @ApiResponse(responseCode = "404", description = "Nenhum paciente cadastrado")
    })
    public ResponseEntity<Page<PatientResponseDTO>> getAllPatients(
            @RequestParam(name = "page", defaultValue = "0") int page) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), 10);
        Page<PatientResponseDTO> response = service.getAllAndReturn(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca paciente por ID (apenas se pertencer ao nutricionista logado)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente encontrado"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado ou não pertence ao nutricionista logado")
    })
    public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable Integer id) {
        PatientResponseDTO response = service.getByIdAndReturn(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um paciente (apenas se pertencer ao nutricionista logado)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado ou não pertence ao nutricionista logado"),
            @ApiResponse(responseCode = "409", description = "Conflito de dados (Email, CPF ou Nome já cadastrado)")
    })
    public ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable Integer id,
                                                            @RequestBody PatientRequestDTO dto) {
        PatientResponseDTO response = service.updateAndReturn(id, dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um paciente (apenas se pertencer ao nutricionista logado)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paciente atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado ou não pertence ao nutricionista logado"),
            @ApiResponse(responseCode = "409", description = "Conflito de dados (Email, CPF ou Nome já cadastrado)")
    })
    public ResponseEntity<PatientResponseDTO> patchPatient(@PathVariable Integer id,
                                                           @RequestBody Map<String, Object> updates) {
        PatientResponseDTO response = service.patchAndReturn(id, updates);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui um paciente (apenas se pertencer ao nutricionista logado)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Paciente excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Paciente não encontrado ou não pertence ao nutricionista logado")
    })
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
