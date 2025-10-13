package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;

    @Transactional
    public PatientModel createPatient(PatientRequestDTO dto) {
        if (!"Masculino".equals(dto.sexo()) && !"Feminino".equals(dto.sexo())) {
            throw new InvalidDataException("Sexo inválido");
        }

        if (!"Solteiro".equals(dto.estadoCivil()) &&
                !"Casado".equals(dto.estadoCivil()) &&
                !"Divorciado".equals(dto.estadoCivil()) &&
                !"Viúvo".equals(dto.estadoCivil())) {
            throw new InvalidDataException("Estado civil inválido");
        }

        PatientModel patient = new PatientModel();
        patient.setNome(dto.nome());
        patient.setEmail(dto.email());
        patient.setCpf(dto.cpf());
        patient.setDataNascimento(dto.dataNascimento());
        patient.setSexo(dto.sexo());
        patient.setEstadoCivil(dto.estadoCivil());
        patient.setDataConsulta(dto.dataConsulta());
        patient.setMotivoConsulta(dto.motivoConsulta());
        patient.setComorbidade(dto.comorbidade());
        patient.setFrequenciaAtividadeFisica(dto.frequenciaAtividadeFisica());

        return repository.save(patient);
    }

    public PatientModel getPatientById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado com ID: " + id));
    }

    public List<PatientModel> getAllPatients() {
        List<PatientModel> patients = repository.findAll();
        if (patients.isEmpty()) {
            throw new NotFoundException("Nenhum paciente cadastrado");
        }
        return patients;
    }

    @Transactional
    public PatientModel updatePatient(Integer id, PatientRequestDTO dto) {
        PatientModel patient = getPatientById(id);

        if (!"Masculino".equals(dto.sexo()) && !"Feminino".equals(dto.sexo())) {
            throw new InvalidDataException("Sexo inválido");
        }

        if (!"Solteiro".equals(dto.estadoCivil()) &&
                !"Casado".equals(dto.estadoCivil()) &&
                !"Divorciado".equals(dto.estadoCivil()) &&
                !"Viúvo".equals(dto.estadoCivil())) {
            throw new InvalidDataException("Estado civil inválido");
        }

        patient.setNome(dto.nome());
        patient.setEmail(dto.email());
        patient.setCpf(dto.cpf());
        patient.setDataNascimento(dto.dataNascimento());
        patient.setSexo(dto.sexo());
        patient.setEstadoCivil(dto.estadoCivil());
        patient.setDataConsulta(dto.dataConsulta());
        patient.setMotivoConsulta(dto.motivoConsulta());
        patient.setComorbidade(dto.comorbidade());
        patient.setFrequenciaAtividadeFisica(dto.frequenciaAtividadeFisica());

        return repository.save(patient);
    }

    @Transactional
    public PatientModel patchPatient(Integer id, Map<String, Object> updates) {
        PatientModel patient = getPatientById(id);

        for (String key : updates.keySet()) {
            Object value = updates.get(key);

            if ("sexo".equals(key)) {
                String sexo = (String) value;
                if (!"Masculino".equals(sexo) && !"Feminino".equals(sexo)) {
                    throw new InvalidDataException("Sexo inválido");
                }
                patient.setSexo(sexo);
            } else if ("estadoCivil".equals(key)) {
                String estadoCivil = (String) value;
                if (!"Solteiro".equals(estadoCivil) &&
                        !"Casado".equals(estadoCivil) &&
                        !"Divorciado".equals(estadoCivil) &&
                        !"Viúvo".equals(estadoCivil)) {
                    throw new InvalidDataException("Estado civil inválido");
                }
                patient.setEstadoCivil(estadoCivil);
            } else if ("dataNascimento".equals(key)) {
                patient.setDataNascimento(LocalDate.parse((String) value));
            } else if ("dataConsulta".equals(key)) {
                patient.setDataConsulta(LocalDate.parse((String) value));
            } else if ("motivoConsulta".equals(key)) {
                patient.setMotivoConsulta((String) value);
            } else if ("comorbidade".equals(key)) {
                patient.setComorbidade((String) value);
            } else if ("frequenciaAtividadeFisica".equals(key)) {
                patient.setFrequenciaAtividadeFisica((Integer) value);
            }
        }

        return repository.save(patient);
    }

    @Transactional
    public void deletePatient(Integer id) {
        if (!repository.existsById(id)) throw new NotFoundException("Paciente não encontrado com ID: " + id);
        repository.deleteById(id);
    }
}
