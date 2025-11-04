package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.login.LoginRequestDTO;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.dto.response.UserResponseDTO;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserAdapter {

    private final UserService userService;

    public UserResponseDTO createUser(UserRequestDTO dto) {
        UserModel user = userService.createUser(dto);
        return mapToResponse(user);
    }

    public UserResponseDTO updateUser(Integer id, UserRequestDTO dto) {
        UserModel user = userService.updateUser(id, dto);
        return mapToResponse(user);
    }

    public UserResponseDTO patchUser(Integer id, Map<String, Object> updates) {
        UserModel user = userService.patchUser(id, updates);
        return mapToResponse(user);
    }

    public UserResponseDTO login(LoginRequestDTO dto) {
        UserModel user = userService.login(dto);
        return mapToResponse(user);
    }

    public UserResponseDTO getUserById(Integer id) {
        UserModel user = userService.getUserById(id);
        return mapToResponse(user);
    }

    public UserResponseDTO getUserByEmail(String email) {
        UserModel user = userService.getUserByEmail(email);
        return mapToResponse(user);
    }

    public UserResponseDTO getUserByCpf(String cpf) {
        UserModel user = userService.getUserByCpf(cpf);
        return mapToResponse(user);
    }

    public List<UserResponseDTO> getAllUsers() {
        List<UserModel> users = userService.getAllUsers();
        return users.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public void deleteUser(Integer id) {
        userService.deleteUser(id);
    }

    private UserResponseDTO mapToResponse(UserModel user) {
        return new UserResponseDTO(user.getId(), user.getNome(), user.getEmail(), user.getCpf(), user.getCrn());
    }
}
