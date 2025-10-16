package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.UserPatientRequest;
import fitt_nutri.example.demo.dto.response.UserPatientResponse;
import fitt_nutri.example.demo.model.UserPatientModel;

public class UserPatientAdapter {

    public static UserPatientModel toModel(UserPatientRequest request) {
        UserPatientModel model = new UserPatientModel();
        model.setNome(request.getNome());
        model.setDataNascimento(request.getDataNascimento());
        model.setSexo(request.getSexo());
        model.setEstadoCivil(request.getEstadoCivil());
        model.setDataConsulta(request.getDataConsulta());
        model.setMotivoConsulta(request.getMotivoConsulta());
        model.setComorbidade(request.getComorbidade());
        model.setFrequenciaAtividadeFisica(request.getFrequenciaAtividadeFisica());
        return model;
    }

    public static UserPatientResponse toResponse(UserPatientModel model) {
        UserPatientResponse response = new UserPatientResponse();
        response.setId(model.getId());
        response.setNome(model.getNome());
        response.setDataNascimento(model.getDataNascimento());
        response.setSexo(model.getSexo());
        response.setEstadoCivil(model.getEstadoCivil());
        response.setDataConsulta(model.getDataConsulta());
        response.setMotivoConsulta(model.getMotivoConsulta());
        response.setComorbidade(model.getComorbidade());
        response.setFrequenciaAtividadeFisica(model.getFrequenciaAtividadeFisica());
        return response;
    }
}
