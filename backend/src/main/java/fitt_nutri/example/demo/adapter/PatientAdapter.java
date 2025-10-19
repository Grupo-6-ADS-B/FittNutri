package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientAdapter {

    private final PatientService service;

    public PatientResponseDTO create(PatientRequestDTO dto) {
        PatientModel patient = service.createPatient(dto);
        return toDTO(patient);
    }

    public List<PatientResponseDTO> getAll() {
        return service.getAllPatients()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PatientResponseDTO getById(Integer id) {
        return toDTO(service.getPatientById(id));
    }

    public PatientResponseDTO update(Integer id, PatientRequestDTO dto) {
        return toDTO(service.updatePatient(id, dto));
    }

    public PatientResponseDTO patch(Integer id, Map<String, Object> updates) {
        return toDTO(service.patchPatient(id, updates));
    }

    public void delete(Integer id) {
        service.deletePatient(id);
    }

    private PatientResponseDTO toDTO(PatientModel patient) {
        return new PatientResponseDTO(
                patient.getId(),
                patient.getNome(),
                patient.getEmail(),
                patient.getCpf(),
                patient.getDataNascimento() != null ? patient.getDataNascimento().toString() : null,
                patient.getSexo(),
                patient.getEstadoCivil(),
                patient.getDataConsulta() != null ? LocalDate.parse(patient.getDataConsulta().toString()) : null,
                patient.getMotivoConsulta(),
                patient.getComorbidade(),
                patient.getFrequenciaAtividadeFisica()
        );
    }
}
