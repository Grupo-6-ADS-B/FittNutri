package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.AlreadyExistingData;
import fitt_nutri.example.demo.exceptions.NotFoundData;
import fitt_nutri.example.demo.exceptions.NotFoundUser;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.repository.AnthropometricDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnthropometricDataService {

    @Autowired
    private AnthropometricDataRepository repository;

    public List<AnthropometricDataModel> listAll() {
        if (repository.findAll().isEmpty()) {
            throw new NotFoundUser("Nenhum dado antropométrico cadastrado");
        }
        return repository.findAll();
    }

    public AnthropometricDataModel getById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundUser("id " + id + " não encontrado"));
    }

    public AnthropometricDataModel create(AnthropometricDataModel data) {
        if (data.getIdDadosAntropometricos() != null && repository.existsById(data.getIdDadosAntropometricos())) {
            throw new AlreadyExistingData("id " + data.getIdDadosAntropometricos() + " já existe");
        }
        if (data.getAltura() > 2.60 || data.getAltura() <= 0) {
            throw new NotFoundData("Altura inválida");
        }
        if (data.getPeso() > 300.2 || data.getPeso() <= 0) {
            throw new NotFoundData("Peso inválido");
        }
        if (data.getTmb() > 3000 || data.getTmb() <= 0) {
            throw new NotFoundData("Taxa Metabólica inválida");
        }
        if (data.getPercentualGordura() > 100 || data.getPercentualGordura() <= 0) {
            throw new NotFoundData("Percentual de gordura inválido");
        }
        if (data.getGorduraVisceral() > 60) {
            throw new NotFoundData("Gordura visceral inválida");
        }
        return repository.save(data);
    }

    public void deleteById(Integer id) {
        if (!repository.existsById(id)) {
            throw new NotFoundUser("id " + id + " não encontrado");
        }
        repository.deleteById(id);
    }

    public AnthropometricDataModel update(AnthropometricDataModel data) {
        return repository.save(data);
    }

    public AnthropometricDataModel partialUpdate(Integer id, Map<String, Object> fields) {
        Optional<AnthropometricDataModel> optionalData = repository.findById(id);
        if (optionalData.isEmpty()) {
            throw new NotFoundData("id " + id + " não encontrado");
        }

        AnthropometricDataModel existingData = optionalData.get();

        fields.forEach((key, value) -> {
            try {
                Field field = AnthropometricDataModel.class.getDeclaredField(key);
                field.setAccessible(true);
                field.set(existingData, value);
            } catch (NoSuchFieldException | IllegalAccessException e) {
                throw new NotFoundData("Campo '" + key + "' inválido para atualização parcial");
            }
        });


        if (existingData.getAltura() > 2.60 || existingData.getAltura() <= 0) {
            throw new NotFoundData("Altura inválida");
        }
        if (existingData.getPeso() > 300.2 || existingData.getPeso() <= 0) {
            throw new NotFoundData("Peso inválido");
        }
        if (existingData.getTmb() > 3000 || existingData.getTmb() <= 0) {
            throw new NotFoundData("Taxa Metabólica inválida");
        }
        if (existingData.getPercentualGordura() > 100 || existingData.getPercentualGordura() <= 0) {
            throw new NotFoundData("Percentual de gordura inválido");
        }
        if (existingData.getGorduraVisceral() > 60) {
            throw new NotFoundData("Gordura visceral inválida");
        }

        return repository.save(existingData);
    }

    public List<AnthropometricDataModel> findByPaciente_Id(Integer pacienteId) {
        List<AnthropometricDataModel> dados = repository.findByPaciente_Id(pacienteId);
        if (dados.isEmpty()) {
            throw new NotFoundData("Nenhum dado antropométrico encontrado para o paciente " + pacienteId);
        }
        return dados;
    }

    public AnthropometricDataModel partialUpdateByPacienteId(Integer pacienteId, Map<String, Object> fields) {
        AnthropometricDataModel existingData = repository.findFirstByPaciente_Id(pacienteId);
        if (existingData == null) {
            throw new NotFoundData("Nenhum dado antropométrico encontrado para o paciente ID " + pacienteId);
        }

        fields.forEach((key, value) -> {
            try {
                Field field = AnthropometricDataModel.class.getDeclaredField(key);
                field.setAccessible(true);
                field.set(existingData, value);
            } catch (NoSuchFieldException | IllegalAccessException e) {
                throw new NotFoundData("Campo '" + key + "' inválido para atualização parcial");
            }
        });

        return repository.save(existingData);
    }
}