package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;

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

        return repository.save(p);
    }

    public List<PatientModel> findAll() {
        return repository.findAll();
    }

    public PatientModel findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
    }

    public PatientModel update(Integer id, PatientRequestDTO dto) {

        PatientModel p = findById(id);

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
        repository.deleteById(id);
    }

    public PatientModel patchPatient(Integer id, Map<String, Object> updates) {

        PatientModel p = findById(id);

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
                default -> {
                    throw new IllegalArgumentException("Campo inválido para PATCH: " + key);
                }
            }
        });

        return repository.save(p);
    }
}
