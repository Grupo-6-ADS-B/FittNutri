package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.PatientRequestDTO;
import fitt_nutri.example.demo.dto.response.PatientResponseDTO;
import fitt_nutri.example.demo.dto.response.UserResponseDTO;
import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;

    public PatientResponseDTO createPatient(PatientRequestDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new ConflictException("Email já cadastrado");
        }
        if (repository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já cadastrado");
        }
        if (repository.existsByNome(dto.nome())) {
            throw new ConflictException("Nome já cadastrado");
        }

        List<String> sexosValidos = Arrays.asList("Masculino", "Feminino");
        if (!sexosValidos.contains(dto.sexo())) {
            throw new InvalidDataException("Sexo inválido");
        }

        List<String> estadosCivisValidos = Arrays.asList("Solteiro", "Casado", "Divorciado", "Viúvo");
        if (!estadosCivisValidos.contains(dto.estadoCivil())) {
            throw new InvalidDataException("Estado civil inválido");
        }

        PatientModel patientModel = new PatientModel();
        patientModel.setNome(dto.nome());
        patientModel.setEmail(dto.email());
        patientModel.setCpf(dto.cpf());
        patientModel.setDataNascimento(dto.dataNascimento());
        patientModel.setSexo(dto.sexo());
        patientModel.setEstadoCivil(dto.estadoCivil());
        patientModel.setDataConsulta(dto.dataConsulta());
        patientModel.setMotivoConsulta(dto.motivoConsulta());
        patientModel.setComorbidade(dto.comorbidade());
        patientModel.setFrequenciaAtividadeFisica(dto.frequenciaAtividadeFisica());

        PatientModel savedPatient = repository.save(patientModel);
        return mapToResponse(savedPatient);

    }

    public List<PatientResponseDTO> getAllPatients() {
        if(repository.findAll().isEmpty()){
            throw new NotFoundException("Nenhum paciente cadastrado");
        }
        return repository.findAll().stream().map(this::mapToResponse).toList();
    }

    public PatientResponseDTO getPatientById(Integer id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Paciente não encontrado com ID: " + id);
        }
        PatientModel patient = repository.findById(id).get();
        return mapToResponse(patient);
    }

    public PatientResponseDTO updatePatient(Integer id, PatientRequestDTO dto) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Paciente não encontrado com ID: " + id);
        }
        PatientModel existingPatient = repository.findById(id).get();

        if (!existingPatient.getEmail().equals(dto.email()) && repository.existsByEmail(dto.email())) {
            throw new ConflictException("Email já cadastrado");
        }
        if (!existingPatient.getCpf().equals(dto.cpf()) && repository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já cadastrado");
        }
        if (!existingPatient.getNome().equals(dto.nome()) && repository.existsByNome(dto.nome())) {
            throw new ConflictException("Nome já cadastrado");
        }

        List<String> sexosValidos = Arrays.asList("Masculino", "Feminino");
        if (!sexosValidos.contains(dto.sexo())) {
            throw new InvalidDataException("Sexo inválido");
        }

        List<String> estadosCivisValidos = Arrays.asList("Solteiro", "Casado", "Divorciado", "Viúvo");
        if (!estadosCivisValidos.contains(dto.estadoCivil())) {
            throw new InvalidDataException("Estado civil inválido");
        }

        existingPatient.setNome(dto.nome());
        existingPatient.setEmail(dto.email());
        existingPatient.setCpf(dto.cpf());
        existingPatient.setDataNascimento(dto.dataNascimento());
        existingPatient.setSexo(dto.sexo());
        existingPatient.setEstadoCivil(dto.estadoCivil());
        existingPatient.setDataConsulta(dto.dataConsulta());
        existingPatient.setMotivoConsulta(dto.motivoConsulta());
        existingPatient.setComorbidade(dto.comorbidade());
        existingPatient.setFrequenciaAtividadeFisica(dto.frequenciaAtividadeFisica());

        PatientModel updatedPatient = repository.save(existingPatient);
        return mapToResponse(updatedPatient);
    }

    public PatientResponseDTO patchPatient(Integer id, Map<String, Object> dto){
        if(!repository.existsById(id)){
            throw new NotFoundException("Paciente não encontrado com ID: " + id);
        }
        PatientModel existingPatient = repository.findById(id).get();

        for (String key : dto.keySet()) {
            Object value = dto.get(key);

            switch (key) {
                case "nome" -> {
                    String nome = (String) value;
                    if (nome.isBlank()) {
                        throw new InvalidDataException("Nome não pode estar vazio");
                    }
                    existingPatient.setNome(nome);
                }

                case "email" -> {
                    String email = (String) value;
                    if (email.isBlank()) {
                        throw new InvalidDataException("Email não pode estar vazio");
                    }
                    if (!existingPatient.getEmail().equals(email) && repository.existsByEmail(email)) {
                        throw new ConflictException("Email já cadastrado");
                    }
                    existingPatient.setEmail(email);
                }

                case "cpf" -> {
                    String cpf = (String) value;
                    if (cpf.isBlank()) {
                        throw new InvalidDataException("CPF não pode estar vazio");
                    }
                    if (!cpf.matches("^\\d{11}$")) {
                        throw new InvalidDataException("CPF inválido");
                    }
                    if (!existingPatient.getCpf().equals(cpf) && repository.existsByCpf(cpf)) {
                        throw new ConflictException("CPF já cadastrado");
                    }
                    existingPatient.setCpf(cpf);
                }

                case "dataNascimento" -> {
                    LocalDate dataNascimento = LocalDate.parse((String) value);
                    existingPatient.setDataNascimento(dataNascimento);
                }

                case "sexo" -> {
                    String sexo = (String) value;
                    List<String> sexosValidos = Arrays.asList("Masculino", "Feminino");
                    if (!sexosValidos.contains(sexo)) {
                        throw new InvalidDataException("Sexo inválido");
                    }
                    existingPatient.setSexo(sexo);
                }

                case "estadoCivil" -> {
                    String estadoCivil = (String) value;
                    List<String> estadosValidos = Arrays.asList("Solteiro", "Casado", "Divorciado", "Viúvo");
                    if (!estadosValidos.contains(estadoCivil)) {
                        throw new InvalidDataException("Estado civil inválido");
                    }
                    existingPatient.setEstadoCivil(estadoCivil);
                }

                case "dataConsulta" -> {
                    LocalDate dataConsulta = LocalDate.parse((String) value);
                    existingPatient.setDataConsulta(dataConsulta);
                }

                case "motivoConsulta" -> {
                    String motivo = (String) value;
                    existingPatient.setMotivoConsulta(motivo);
                }

                case "comorbidade" -> {
                    String comorbidade = (String) value;
                    existingPatient.setComorbidade(comorbidade);
                }

                case "frequenciaAtividadeFisica" -> {
                    Integer frequencia = (Integer) value;
                    existingPatient.setFrequenciaAtividadeFisica(frequencia);
                }

                default -> throw new InvalidDataException("Campo '" + key + "' não é permitido para atualização");
            }
        }

        PatientModel updatedPatient = repository.save(existingPatient);
        return mapToResponse(updatedPatient);
    }


    public void deletePatient(Integer id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Paciente não encontrado com ID: " + id);
        }
        PatientModel patient = repository.findById(id).get();
         repository.deleteById(id);
    }





    private PatientResponseDTO mapToResponse(PatientModel patient) {
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
