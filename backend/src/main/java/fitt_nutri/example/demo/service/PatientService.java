package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

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

    @Transactional(readOnly = true)
    public void validateRegistration(PatientRequestDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new ConflictException("Email já cadastrado");
        }
        if (repository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já cadastrado");
        }
    }

    @Transactional
    public PatientModel create(PatientRequestDTO dto) {
        validateRegistration(dto);

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
        p.setMotivoConsulta(dto.motivoConsulta());
        p.setNutricionista(getNutricionistaLogado());
        try {
            PatientModel saved = repository.save(p);
            repository.flush();
            return saved;
        } catch (DataIntegrityViolationException ex) {
            String message = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
            String normalized = message == null ? "" : message.toLowerCase();

            if (normalized.contains("cpf")) {
                throw new ConflictException("CPF já cadastrado");
            }
            if (normalized.contains("email")) {
                throw new ConflictException("Email já cadastrado");
            }

            throw new ConflictException("Dados já cadastrados");
        }
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
        if (!p.getEmail().equals(dto.email()) && repository.existsByEmail(dto.email())) {
            throw new ConflictException("Email já cadastrado");
        }
        if (!p.getCpf().equals(dto.cpf()) && repository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já cadastrado");
        }
        p.setNome(dto.nome());
        p.setEmail(dto.email());
        p.setCpf(dto.cpf());
        p.setTelefone(dto.telefone());
        p.setEstado(dto.estado());
        p.setCidade(dto.cidade());
        p.setSexo(dto.sexo());
        p.setEtnia(dto.etnia());
        p.setAtividade(dto.atividade());
        p.setMotivoConsulta(dto.motivoConsulta());
        try {
            PatientModel saved = repository.save(p);
            repository.flush();
            return saved;
        } catch (DataIntegrityViolationException ex) {
            String message = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
            String normalized = message == null ? "" : message.toLowerCase();

            if (normalized.contains("cpf")) {
                throw new ConflictException("CPF já cadastrado");
            }
            if (normalized.contains("email")) {
                throw new ConflictException("Email já cadastrado");
            }

            throw new ConflictException("Dados já cadastrados");
        }
    }

    @Transactional
    public void delete(Integer id) {
        PatientModel p = findByIdAndNutricionista(id);
        p.setDeletedAt(java.time.LocalDateTime.now());
        repository.save(p);
    }

    @Transactional
    public PatientModel patchPatient(Integer id, Map<String, Object> updates) {
        PatientModel p = findByIdAndNutricionista(id);
        updates.forEach((key, value) -> {
            switch (key) {
                case "nome" -> {
                    String nome = String.valueOf(value);
                    p.setNome(nome);
                }
                case "email" -> {
                    String email = String.valueOf(value);
                    if (!p.getEmail().equals(email) && repository.existsByEmail(email)) {
                        throw new ConflictException("Email já cadastrado");
                    }
                    p.setEmail(email);
                }
                case "cpf" -> {
                    String cpf = String.valueOf(value);
                    if (!p.getCpf().equals(cpf) && repository.existsByCpf(cpf)) {
                        throw new ConflictException("CPF já cadastrado");
                    }
                    p.setCpf(cpf);
                }
                case "telefone" -> p.setTelefone(String.valueOf(value));
                case "estado" -> p.setEstado(String.valueOf(value));
                case "cidade" -> p.setCidade(String.valueOf(value));
                case "sexo" -> p.setSexo(String.valueOf(value));
                case "etnia" -> p.setEtnia(String.valueOf(value));
                case "frequenciaAtividadeFisica" -> p.setAtividade(String.valueOf(value));
                case "motivoConsulta" -> p.setMotivoConsulta(String.valueOf(value));
                default -> throw new IllegalArgumentException("Campo inválido para PATCH: " + key);
            }
        });
        try {
            PatientModel saved = repository.save(p);
            repository.flush();
            return saved;
        } catch (DataIntegrityViolationException ex) {
            String message = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
            String normalized = message == null ? "" : message.toLowerCase();

            if (normalized.contains("cpf")) {
                throw new ConflictException("CPF já cadastrado");
            }
            if (normalized.contains("email")) {
                throw new ConflictException("Email já cadastrado");
            }

            throw new ConflictException("Dados já cadastrados");
        }
    }
}
