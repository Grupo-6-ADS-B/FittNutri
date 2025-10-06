package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.UserNutritionistRequest;
import fitt_nutri.example.demo.dto.response.UserNutritionistResponse;
import fitt_nutri.example.demo.model.UserNutritionistModel;

public class UserNutritionistAdapter {

    public static UserNutritionistModel toModel(UserNutritionistRequest request) {
        UserNutritionistModel model = new UserNutritionistModel();
        model.setNome(request.getNome());
        model.setEmail(request.getEmail());
        model.setCpf(request.getCpf());
        model.setCrn(request.getCrn());
        model.setSenha(request.getSenha());
        return model;
    }

    public static UserNutritionistResponse toResponse(UserNutritionistModel model) {
        UserNutritionistResponse response = new UserNutritionistResponse();
        response.setId(model.getId());
        response.setNome(model.getNome());
        response.setEmail(model.getEmail());
        response.setCpf(model.getCpf());
        response.setCrn(model.getCrn());
        return response;
    }
}
