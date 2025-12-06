package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PatientAdapter {

    private final PatientService service;

    public PatientResponseDTO create(PatientRequestDTO dto) {
        return toDTO(service.create(dto));
    }

    public List<PatientResponseDTO> getAll() {
        return service.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public PatientResponseDTO getById(Integer id) {
        return toDTO(service.findById(id));
    }

    public PatientResponseDTO update(Integer id, PatientRequestDTO dto) {
        return toDTO(service.update(id, dto));
    }

    public void delete(Integer id) {
        service.delete(id);
    }

    public PatientResponseDTO patch(Integer id, Map<String, Object> updates) {
        PatientModel updated = service.patchPatient(id, updates);
        return toDTO(updated);
    }


    private PatientResponseDTO toDTO(PatientModel p) {
        return new PatientResponseDTO(
                p.getId(),
                p.getNome(),
                p.getEmail(),
                p.getCpf(),
                p.getTelefone(),
                p.getEstado(),
                p.getCidade(),
                p.getSexo(),
                p.getEtnia(),
                p.getAtividade()
        );
    }
}
