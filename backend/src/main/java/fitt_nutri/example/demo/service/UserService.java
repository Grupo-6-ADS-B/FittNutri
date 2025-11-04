package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.login.LoginRequestDTO;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserModel createUser(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Email já existe");
        } else if (userRepository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já existe");
        } else if (userRepository.findByCrn(dto.crn()).isPresent()) {
            throw new ConflictException("CRN já existe");
        }

        UserModel user = new UserModel();
        user.setNome(dto.nome());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setCrn(dto.crn());
        user.setSenha(dto.senha());
        return userRepository.save(user);
    }

    public List<UserModel> getAllUsers() {
        List<UserModel> users = new ArrayList<>();
        for (UserModel user : userRepository.findAll()) {
            users.add(user);
        }

        if (users.isEmpty()) {
            throw new NotFoundException("Nenhum usuário cadastrado");
        }

        return users;
    }

    public UserModel getUserById(Integer id) {
        if (userRepository.existsById(id)) {
            return userRepository.findById(id).get();
        } else {
            throw new NotFoundException("Usuário não encontrado");
        }
    }

    public UserModel getUserByEmail(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            return userRepository.findByEmail(email).get();
        } else {
            throw new NotFoundException("Usuário não encontrado");
        }
    }

    public UserModel getUserByCpf(String cpf) {
        if (userRepository.findByCpf(cpf).isPresent()) {
            return userRepository.findByCpf(cpf).get();
        } else {
            throw new NotFoundException("Usuário não encontrado");
        }
    }

    public UserModel updateUser(Integer id, UserRequestDTO dto) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("Usuário não encontrado");
        }

        UserModel user = userRepository.findById(id).get();

        if (!user.getEmail().equals(dto.email()) && userRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Email já existe");
        } else if (!user.getCpf().equals(dto.cpf()) && userRepository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já existe");
        } else if (!user.getCrn().equals(dto.crn()) && userRepository.findByCrn(dto.crn()).isPresent()) {
            throw new ConflictException("CRN já existe");
        }

        user.setNome(dto.nome());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setCrn(dto.crn());
        user.setSenha(dto.senha());

        return userRepository.save(user);
    }

    public UserModel patchUser(Integer id, Map<String, Object> updates) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("Usuário não encontrado");
        }

        UserModel user = userRepository.findById(id).get();

        for (String key : updates.keySet()) {
            Object value = updates.get(key);

            if ("nome".equals(key)) {
                user.setNome((String) value);
            } else if ("email".equals(key)) {
                String email = (String) value;
                if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
                    throw new ConflictException("Email já existe");
                }
                user.setEmail(email);
            } else if ("cpf".equals(key)) {
                String cpf = (String) value;
                if (!user.getCpf().equals(cpf) && userRepository.existsByCpf(cpf)) {
                    throw new ConflictException("CPF já existe");
                }
                user.setCpf(cpf);
            } else if ("crn".equals(key)) {
                String crn = (String) value;
                if (!user.getCrn().equals(crn) && userRepository.findByCrn(crn).isPresent()) {
                    throw new ConflictException("CRN já existe");
                }
                user.setCrn(crn);
            } else if ("senha".equals(key)) {
                user.setSenha((String) value);
            }
        }

        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
        } else {
            throw new NotFoundException("Usuário não encontrado");
        }
    }

    public UserModel login(LoginRequestDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            UserModel user = userRepository.findByEmail(dto.getEmail()).get();
            if (!user.getSenha().equals(dto.getSenha())) {
                throw new ConflictException("Senha incorreta");
            }
            return user;
        } else {
            throw new NotFoundException("Usuário não encontrado");
        }
    }
}
