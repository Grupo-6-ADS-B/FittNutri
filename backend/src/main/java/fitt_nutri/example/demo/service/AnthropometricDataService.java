package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.AlreadyExistingData;
import fitt_nutri.example.demo.exceptions.NotFoundData;
import fitt_nutri.example.demo.exceptions.NotFoundUser;
import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.AnthropometricDataRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Map;

@Service
public class AnthropometricDataService {

    @Autowired
    private AnthropometricDataRepository repository;

    @Autowired
    private PatientRepository patientRepository;

    private void verificarPropriedadePaciente(PatientModel patient) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (patient.getNutricionista() == null || !emailLogado.equals(patient.getNutricionista().getEmail())) {
            throw new AccessDeniedException("Acesso negado: este paciente não pertence ao nutricionista logado");
        }
    }

    public List<AnthropometricDataModel> listAll() {
        if (repository.findAll().isEmpty()) {
            throw new NotFoundUser("Nenhum dado antropométrico cadastrado");
        }
        return repository.findAll();
    }

    public AnthropometricDataModel getById(Integer id) {
        AnthropometricDataModel data = repository.findById(id)
                .orElseThrow(() -> new NotFoundUser("id " + id + " não encontrado"));
        verificarPropriedadePaciente(data.getPaciente());
        return data;
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
        AnthropometricDataModel data = repository.findById(id)
                .orElseThrow(() -> new NotFoundUser("id " + id + " não encontrado"));
        verificarPropriedadePaciente(data.getPaciente());
        repository.deleteById(id);
    }

    public AnthropometricDataModel update(AnthropometricDataModel data) {

        AnthropometricDataModel existente = repository.findById(data.getIdDadosAntropometricos())
                .orElseThrow(() -> new NotFoundData("ID " + data.getIdDadosAntropometricos() + " não encontrado"));
        verificarPropriedadePaciente(existente.getPaciente());

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
        AnthropometricDataModel existingData = repository.findById(id)
                .orElseThrow(() -> new NotFoundData("id " + id + " não encontrado"));
        verificarPropriedadePaciente(existingData.getPaciente());

        fields.forEach((key, value) -> {
            switch (key) {
                case "altura"              -> existingData.setAltura(toDouble(value, key));
                case "peso"               -> existingData.setPeso(toDouble(value, key));
                case "imc"                -> existingData.setImc(toDouble(value, key));
                case "porcentagemGordura" -> existingData.setPorcentagemGordura(toDouble(value, key));
                case "massaMuscular"      -> existingData.setMassaMuscular(toDouble(value, key));
                case "taxaMetabolicaBasal"-> existingData.setTaxaMetabolicaBasal(toDouble(value, key));
                case "idadeMetabolica"    -> existingData.setIdadeMetabolica(toInt(value, key));
                case "gorduraVisceral"    -> existingData.setGorduraVisceral(toDouble(value, key));
                case "idDadosAntropometricos", "paciente" ->
                    throw new NotFoundData("Campo não permitido no PATCH: " + key);
                default -> throw new NotFoundData("Campo '" + key + "' inválido para atualização parcial");
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
        PatientModel patient = patientRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundUser("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);
        return repository.findByPaciente_Id(pacienteId);
    }

    public AnthropometricDataModel partialUpdateByPacienteId(Integer pacienteId, Map<String, Object> fields) {
        PatientModel paciente = patientRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundData("Paciente não encontrado"));
        verificarPropriedadePaciente(paciente);

        List<AnthropometricDataModel> existentes = repository.findByPaciente_Id(pacienteId);

        AnthropometricDataModel data;
        if (existentes.isEmpty()) {
            data = new AnthropometricDataModel();
            data.setPaciente(paciente);
        } else {
            data = existentes.get(0);
        }

        fields.forEach((key, value) -> {
            switch (key) {
                case "altura"              -> data.setAltura(toDouble(value, key));
                case "peso"               -> data.setPeso(toDouble(value, key));
                case "imc"                -> data.setImc(toDouble(value, key));
                case "porcentagemGordura" -> data.setPorcentagemGordura(toDouble(value, key));
                case "massaMuscular"      -> data.setMassaMuscular(toDouble(value, key));
                case "taxaMetabolicaBasal"-> data.setTaxaMetabolicaBasal(toDouble(value, key));
                case "idadeMetabolica"    -> data.setIdadeMetabolica(toInt(value, key));
                case "gorduraVisceral"    -> data.setGorduraVisceral(toDouble(value, key));
                case "idDadosAntropometricos", "paciente" ->
                    throw new NotFoundData("Campo não permitido no PATCH: " + key);
                default -> {} // ignora campos desconhecidos
            }
        });

        return repository.save(data);
    }

    private Double toDouble(Object value, String campo) {
        if (value == null) throw new NotFoundData(campo + " não pode ser nulo");
        if (value instanceof Number n) return n.doubleValue();
        try { return Double.valueOf(value.toString()); }
        catch (NumberFormatException e) { throw new NotFoundData("Valor inválido para " + campo + ": " + value); }
    }

    private Integer toInt(Object value, String campo) {
        if (value == null) throw new NotFoundData(campo + " não pode ser nulo");
        if (value instanceof Number n) return n.intValue();
        try { return Integer.valueOf(value.toString()); }
        catch (NumberFormatException e) { throw new NotFoundData("Valor inválido para " + campo + ": " + value); }
    }




    public AnthropometricDataModel createByPaciente(Integer patientId, AnthropometricDataModel data) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundData("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);
        data.setPaciente(patient);
        return repository.save(data);
    }


}