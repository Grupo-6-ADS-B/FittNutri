package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.ResourceNotFoundException;
import fitt_nutri.example.demo.adapter.UserPatientAdapter;
import fitt_nutri.example.demo.dto.request.UserPatientRequest;
import fitt_nutri.example.demo.dto.response.UserPatientResponse;
import fitt_nutri.example.demo.model.UserPatientModel;
import fitt_nutri.example.demo.repository.UserPatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserPatientService {

    private final UserPatientRepository repository;

    public UserPatientResponse cadastrar(UserPatientRequest request) {


        UserPatientModel model = UserPatientAdapter.toModel(request);
        UserPatientModel saved = repository.save(model);
        return UserPatientAdapter.toResponse(saved);
    }

    public List<UserPatientResponse> listarTodos() {
        return repository.findAll()
                .stream()
                .map(UserPatientAdapter::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserPatientResponse> buscarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(UserPatientAdapter::toResponse)
                .collect(Collectors.toList());
    }

    public UserPatientResponse buscarPorId(Integer id) {
        UserPatientModel patient = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado com ID: " + id));
        return UserPatientAdapter.toResponse(patient);
    }

    public UserPatientResponse atualizar(Integer id, UserPatientRequest request) {
        UserPatientModel existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado para atualização com ID: " + id));

        existing.setNome(request.getNome());
        existing.setDataNascimento(request.getDataNascimento());
        existing.setSexo(request.getSexo());
        existing.setEstadoCivil(request.getEstadoCivil());
        existing.setDataConsulta(request.getDataConsulta());
        existing.setMotivoConsulta(request.getMotivoConsulta());
        existing.setComorbidade(request.getComorbidade());
        existing.setFrequenciaAtividadeFisica(request.getFrequenciaAtividadeFisica());

        UserPatientModel updated = repository.save(existing);
        return UserPatientAdapter.toResponse(updated);
    }

    public UserPatientResponse atualizarParcial(Integer id, UserPatientRequest request) {
        UserPatientModel existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado para atualização parcial com ID: " + id));

        if (request.getNome() != null) {
            existing.setNome(request.getNome());
        }
        if (request.getDataNascimento() != null) {
            existing.setDataNascimento(request.getDataNascimento());
        }
        if (request.getSexo() != null) {
            existing.setSexo(request.getSexo());
        }
        if (request.getEstadoCivil() != null) {
            existing.setEstadoCivil(request.getEstadoCivil());
        }
        if (request.getDataConsulta() != null) {
            existing.setDataConsulta(request.getDataConsulta());
        }
        if (request.getMotivoConsulta() != null) {
            existing.setMotivoConsulta(request.getMotivoConsulta());
        }
        if (request.getComorbidade() != null) {
            existing.setComorbidade(request.getComorbidade());
        }
        if (request.getFrequenciaAtividadeFisica() != null) {
            existing.setFrequenciaAtividadeFisica(request.getFrequenciaAtividadeFisica());
        }

        UserPatientModel updated = repository.save(existing);
        return UserPatientAdapter.toResponse(updated);
    }

    public void excluir(Integer id) {
        if (!repository.existsById(id))
            throw new ResourceNotFoundException("Paciente não encontrado para exclusão com ID: " + id);

        repository.deleteById(id);
    }

    public long contarTodos() {
        return repository.count();
    }
}