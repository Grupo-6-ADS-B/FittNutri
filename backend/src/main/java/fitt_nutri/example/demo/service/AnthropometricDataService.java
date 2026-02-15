package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.AlreadyExistingData;
import fitt_nutri.example.demo.exceptions.NotFoundData;
import fitt_nutri.example.demo.exceptions.NotFoundUser;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.AnthropometricDataRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.ReflectionUtils;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnthropometricDataService {

    @Autowired
    private AnthropometricDataRepository repository;

    @Autowired
    private PatientRepository patientRepository;

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
        if (data.getTaxaMetabolicaBasal() > 3000 || data.getTaxaMetabolicaBasal() <= 0) {
            throw new NotFoundData("Taxa Metabólica inválida");
        }
        if (data.getPorcentagemGordura() > 100 || data.getPorcentagemGordura() <= 0) {
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

        AnthropometricDataModel existente = repository.findById(data.getIdDadosAntropometricos())
                .orElseThrow(() -> new NotFoundData("ID " + data.getIdDadosAntropometricos() + " não encontrado"));

        existente.setAltura(data.getAltura());
        existente.setPeso(data.getPeso());
        existente.setImc(data.getImc());
        existente.setPorcentagemGordura(data.getPorcentagemGordura());
        existente.setMassaMuscular(data.getMassaMuscular());
        existente.setTaxaMetabolicaBasal(data.getTaxaMetabolicaBasal());
        existente.setIdadeMetabolica(data.getIdadeMetabolica());
        existente.setGorduraVisceral(data.getGorduraVisceral());
        existente.setPaciente(data.getPaciente());

        return repository.save(existente);
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
        if (existingData.getTaxaMetabolicaBasal() > 3000 || existingData.getTaxaMetabolicaBasal() <= 0) {
            throw new NotFoundData("Taxa Metabólica inválida");
        }
        if (existingData.getPorcentagemGordura() > 100 || existingData.getPorcentagemGordura() <= 0) {
            throw new NotFoundData("Percentual de gordura inválido");
        }
        if (existingData.getGorduraVisceral() > 60) {
            throw new NotFoundData("Gordura visceral inválida");
        }

        return repository.save(existingData);
    }

    public List<AnthropometricDataModel> findByPaciente_Id(Integer pacienteId) {
        List<AnthropometricDataModel> dados = repository.findByPaciente_Id(pacienteId);
        // Não lança exceção se não houver dados, apenas retorna lista vazia
        return dados;
    }

    public AnthropometricDataModel partialUpdateByPacienteId(Integer pacienteId, Map<String, Object> fields) {

        List<AnthropometricDataModel> existentes =
                repository.findByPaciente_Id(pacienteId);

        AnthropometricDataModel data;

        if (existentes.isEmpty()) {
            data = new AnthropometricDataModel();

            PatientModel paciente = patientRepository.findById(pacienteId)
                    .orElseThrow(() -> new NotFoundData("Paciente não encontrado"));

            data.setPaciente(paciente);
        } else {
            data = existentes.get(0);
        }

        fields.forEach((key, value) -> {
            Field field = ReflectionUtils.findField(AnthropometricDataModel.class, key);
            if (field != null) {
                field.setAccessible(true);

                Object convertedValue = convertValue(field.getType(), value);

                ReflectionUtils.setField(field, data, convertedValue);
            }
        });

        return repository.save(data);
    }

    /** Conversão automática de tipos */
    private Object convertValue(Class<?> targetType, Object value) {
        if (value == null) return null;

        if (targetType.equals(Double.class)) {
            if (value instanceof Number n) return n.doubleValue();
            return Double.valueOf(value.toString());
        }

        if (targetType.equals(Integer.class)) {
            if (value instanceof Number n) return n.intValue();
            return Integer.valueOf(value.toString());
        }

        if (targetType.equals(String.class)) {
            return value.toString();
        }

        return value;
    }



    public AnthropometricDataModel createByPaciente(Integer patientId, AnthropometricDataModel data) {

        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundData("Paciente não encontrado"));

        data.setPaciente(patient);

        return repository.save(data);
    }


}