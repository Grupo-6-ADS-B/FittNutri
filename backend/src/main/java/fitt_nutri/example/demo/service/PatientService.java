package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;
    private final UserRepository userRepository;

    private UserModel getNutricionistaLogado() {
        String emailNutri = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(emailNutri)
                .orElseThrow(() -> new RuntimeException("Nutricionista não encontrado"));
    }

    public PatientModel create(PatientRequestDTO dto) {
        PatientModel p = new PatientModel();
        p.setNome(dto.nome());
        p.setEmail(dto.email());
        p.setCpf(dto.cpf());
        p.setTelefone(dto.telefone());
        p.setEstado(dto.estado());
        p.setCidade(dto.cidade());
        p.setSexo(dto.sexo());
        p.setEtnia(dto.etnia());
        p.setAtividade(dto.atividade());
        p.setNutricionista(getNutricionistaLogado());
        return repository.save(p);
    }

    public List<PatientModel> findAllByNutricionista() {
        return repository.findByNutricionista(getNutricionistaLogado());
    }

    public Page<PatientModel> findAllByNutricionista(Pageable pageable) {
        UserModel nutri = getNutricionistaLogado();
        return repository.findByNutricionista(nutri, pageable);
    }

    public PatientModel findByIdAndNutricionista(Integer id) {
        UserModel nutri = getNutricionistaLogado();
        return repository.findById(id)
                .filter(p -> p.getNutricionista().equals(nutri))
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado ou não pertence ao nutricionista logado"));
    }

    public PatientModel update(Integer id, PatientRequestDTO dto) {
        PatientModel p = findByIdAndNutricionista(id);
        p.setNome(dto.nome());
        p.setEmail(dto.email());
        p.setCpf(dto.cpf());
        p.setTelefone(dto.telefone());
        p.setEstado(dto.estado());
        p.setCidade(dto.cidade());
        p.setSexo(dto.sexo());
        p.setEtnia(dto.etnia());
        p.setAtividade(dto.atividade());
        return repository.save(p);
    }

    public void delete(Integer id) {
        PatientModel p = findByIdAndNutricionista(id);
        repository.delete(p);
    }

    public PatientModel patchPatient(Integer id, Map<String, Object> updates) {
        PatientModel p = findByIdAndNutricionista(id);
        updates.forEach((key, value) -> {
            switch (key) {
                case "nome" -> p.setNome(String.valueOf(value));
                case "email" -> p.setEmail(String.valueOf(value));
                case "cpf" -> p.setCpf(String.valueOf(value));
                case "telefone" -> p.setTelefone(String.valueOf(value));
                case "estado" -> p.setEstado(String.valueOf(value));
                case "cidade" -> p.setCidade(String.valueOf(value));
                case "sexo" -> p.setSexo(String.valueOf(value));
                case "etnia" -> p.setEtnia(String.valueOf(value));
                case "frequenciaAtividadeFisica" -> p.setAtividade(String.valueOf(value));
                default -> throw new IllegalArgumentException("Campo inválido para PATCH: " + key);
            }
        });
        return repository.save(p);
    }

    // ===== MÉTODOS COM RETORNO DTO (para Controller) =====

    public PatientResponseDTO createAndReturn(PatientRequestDTO dto) {
        PatientModel p = create(dto);
        return mapToResponseDTO(p);
    }

    public Page<PatientResponseDTO> getAllAndReturn(Pageable pageable) {
        Page<PatientModel> patients = findAllByNutricionista(pageable);
        return patients.map(this::mapToResponseDTO);
    }

    public PatientResponseDTO getByIdAndReturn(Integer id) {
        PatientModel p = findByIdAndNutricionista(id);
        return mapToResponseDTO(p);
    }

    public PatientResponseDTO updateAndReturn(Integer id, PatientRequestDTO dto) {
        PatientModel p = update(id, dto);
        return mapToResponseDTO(p);
    }

    public PatientResponseDTO patchAndReturn(Integer id, Map<String, Object> updates) {
        PatientModel p = patchPatient(id, updates);
        return mapToResponseDTO(p);
    }

    private PatientResponseDTO mapToResponseDTO(PatientModel p) {
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
                p.getNutricionista().getId()
        );
    }
}
