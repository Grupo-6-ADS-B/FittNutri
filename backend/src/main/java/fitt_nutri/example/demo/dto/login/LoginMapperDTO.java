package fitt_nutri.example.demo.dto.login;

import fitt_nutri.example.demo.model.UserModel;

public class LoginMapperDTO {

    public static UserModel of(LoginCreateDTO loginCreateDTO) {
        UserModel userModel = new UserModel();

        userModel.setNome(loginCreateDTO.getNome());
        userModel.setEmail(loginCreateDTO.getEmail());
        userModel.setSenha(loginCreateDTO.getSenha());
        userModel.setCpf(loginCreateDTO.getCpf());   // 👈 adicionar
        userModel.setCrn(loginCreateDTO.getCrn());   // 👈 adicionar
        return userModel;
    }


    public static UserModel of (LoginRequestDTO loginRequestDTO) {
        UserModel userModel = new UserModel();

        userModel.setEmail(loginRequestDTO.getEmail());
        userModel.setSenha(loginRequestDTO.getSenha());
        return userModel;
    }

    public static LoginTokenDTO of (UserModel userModel, String token) {
        LoginTokenDTO loginTokenDTO = new LoginTokenDTO();

        loginTokenDTO.setId(Long.valueOf(userModel.getId()));
        loginTokenDTO.setNome(userModel.getNome());
        loginTokenDTO.setEmail(userModel.getEmail());
        loginTokenDTO.setToken(token);
        return loginTokenDTO;
    }

    public static LoginListDTO of(UserModel userModel) {
        LoginListDTO loginListDTO = new LoginListDTO();

        loginListDTO.setId(userModel.getId());
        loginListDTO.setNome(userModel.getNome());
        loginListDTO.setEmail(userModel.getEmail());
        return loginListDTO;
    }
}
