package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PatientAdapter {

    private final PatientService service;

    public PatientResponseDTO create(PatientRequestDTO dto) {
        PatientModel p = service.create(dto);
        return mapToDTO(p);
    }

    public List<PatientResponseDTO> getAll() {
        List<PatientModel> patients = service.findAllByNutricionista();
        return patients.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PatientResponseDTO getById(Integer id) {
        PatientModel p = service.findByIdAndNutricionista(id);
        return mapToDTO(p);
    }

    public PatientResponseDTO update(Integer id, PatientRequestDTO dto) {
        PatientModel p = service.update(id, dto);
        return mapToDTO(p);
    }

    public PatientResponseDTO patch(Integer id, Map<String, Object> updates) {
        PatientModel p = service.patchPatient(id, updates);
        return mapToDTO(p);
    }

    public void delete(Integer id) {
        service.delete(id);
    }

    private PatientResponseDTO mapToDTO(PatientModel p) {
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
                p.getAtividade(),
                p.getNutricionista().getId()  // retorna o id do nutricionista associado
        );
    }
}
