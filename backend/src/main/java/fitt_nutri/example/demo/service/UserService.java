package fitt_nutri.example.demo.service;


import fitt_nutri.example.demo.dto.request.LoginRequestDTO;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.dto.response.UserResponseDTO;
import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDTO createUser(UserRequestDTO dto) {
        validateUniqueFields(dto);
        UserModel user = new UserModel();
        user.setNome(dto.nome());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setCrn(dto.crn());
        user.setSenha(dto.senha());
        return mapToResponse(userRepository.save(user));
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(Integer id) {
        return mapToResponse(userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado")));
    }

    public UserResponseDTO getUserByEmail(String email) {
        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        return mapToResponse(user);
    }

    public UserResponseDTO getUserByCpf(String cpf) {
        UserModel user = userRepository.findByCpf(cpf)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        return mapToResponse(user);
    }

    public UserResponseDTO updateUser(Integer id, UserRequestDTO dto) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        validateUniqueFields(dto, id);
        user.setNome(dto.nome());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setCrn(dto.crn());
        user.setSenha(dto.senha());
        return mapToResponse(userRepository.save(user));
    }

    public UserResponseDTO patchUser(Integer id, Map<String, Object> updates) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        updates.forEach((key, value) -> {
            switch (key) {
                case "nome" -> user.setNome((String) value);
                case "email" -> {
                    if (userRepository.existsByEmail((String) value) && !user.getEmail().equals(value))
                        throw new ConflictException("Email já existe");
                    user.setEmail((String) value);
                }
                case "cpf" -> {
                    if (userRepository.existsByCpf((String) value) && !user.getCpf().equals(value))
                        throw new ConflictException("CPF já existe");
                    user.setCpf((String) value);
                }
                case "crn" -> {
                    if (userRepository.existsByCrn((String) value) && !user.getCrn().equals(value))
                        throw new ConflictException("CRN já existe");
                    user.setCrn((String) value);
                }
                case "senha" -> user.setSenha((String) value);
            }
        });

        return mapToResponse(userRepository.save(user));
    }

    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id))
            throw new NotFoundException("Usuário não encontrado");
        userRepository.deleteById(id);
    }

    public UserResponseDTO login(LoginRequestDTO dto) {
        UserModel user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        if (!user.getSenha().equals(dto.getSenha()))
            throw new ConflictException("Senha incorreta");

        return mapToResponse(user);
    }


    private void validateUniqueFields(UserRequestDTO dto) {
        validateUniqueFields(dto, null);
    }

    private void validateUniqueFields(UserRequestDTO dto, Integer idToIgnore) {
        if (userRepository.existsByEmail(dto.email()) &&
                (idToIgnore == null || !userRepository.findByEmail(dto.email()).get().getId().equals(idToIgnore))) {
            throw new ConflictException("Email já existe");
        }

        if (userRepository.existsByCpf(dto.cpf()) &&
                (idToIgnore == null || !userRepository.findByCpf(dto.cpf()).get().getId().equals(idToIgnore))) {
            throw new ConflictException("CPF já existe");
        }

        userRepository.findByCrn(dto.crn()).ifPresent(user -> {
            if (idToIgnore == null || !user.getId().equals(idToIgnore)) {
                throw new ConflictException("CRN já existe");
            }
        });
    }


    private UserResponseDTO mapToResponse(UserModel user) {
        return new UserResponseDTO(user.getId(), user.getNome(), user.getEmail(), user.getCpf(), user.getCrn());
    }
}
