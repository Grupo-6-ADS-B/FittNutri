package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.login.LoginRequestDTO;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private boolean emailEmUsoPorOutroUsuario(Integer id, String email) {
        String emailNormalizado = normalizarEmail(email);
        return userRepository.findByEmail(emailNormalizado)
                .filter(usuario -> !usuario.getId().equals(id))
                .isPresent();
    }

    public UserModel createUser(UserRequestDTO dto) {
        String email = normalizarEmail(dto.email());

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email já cadastrado");
        } else if (userRepository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já cadastrado");
        } else if (userRepository.findByCrn(dto.crn()).isPresent()) {
            throw new ConflictException("CRN já cadastrado");
        }

        UserModel user = new UserModel();
        user.setNome(dto.nome());
        user.setEmail(email);
        user.setCpf(dto.cpf());
        user.setCrn(dto.crn());
        user.setSenha(passwordEncoder.encode(dto.senha()));
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
        verificarPropriedade(id);
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
    }

    public UserModel getUserByEmail(String email) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!emailLogado.equals(email)) {
            throw new AccessDeniedException("Acesso negado: você só pode consultar seus próprios dados");
        }
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
    }

    public UserModel getUserByCpf(String cpf) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        UserModel user = userRepository.findByCpf(cpf)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        if (!emailLogado.equals(user.getEmail())) {
            throw new AccessDeniedException("Acesso negado: você só pode consultar seus próprios dados");
        }
        return user;
    }

    public UserModel updateUser(Integer id, UserRequestDTO dto) {
        verificarPropriedade(id);
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("Usuário não encontrado");
        }

        UserModel user = userRepository.findById(id).get();
        String email = normalizarEmail(dto.email());

        if (emailEmUsoPorOutroUsuario(id, email)) {
            throw new ConflictException("Email já cadastrado");
        } else if (!user.getCpf().equals(dto.cpf()) && userRepository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já cadastrado");
        } else if (!user.getCrn().equals(dto.crn()) && userRepository.findByCrn(dto.crn()).isPresent()) {
            throw new ConflictException("CRN já cadastrado");
        }

        user.setNome(dto.nome());
        user.setEmail(email);
        user.setCpf(dto.cpf());
        user.setCrn(dto.crn());
        user.setSenha(passwordEncoder.encode(dto.senha()));

        return userRepository.save(user);
    }

    public UserModel patchUser(Integer id, Map<String, Object> updates) {
        verificarPropriedade(id);
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("Usuário não encontrado");
        }

        UserModel user = userRepository.findById(id).get();

        for (String key : updates.keySet()) {
            Object value = updates.get(key);

            if ("nome".equals(key)) {
                user.setNome((String) value);
            } else if ("email".equals(key)) {
                String email = normalizarEmail((String) value);
                if (emailEmUsoPorOutroUsuario(id, email)) {
                    throw new ConflictException("Email já cadastrado");
                }
                user.setEmail(email);
            } else if ("cpf".equals(key)) {
                String cpf = (String) value;
                if (!user.getCpf().equals(cpf) && userRepository.existsByCpf(cpf)) {
                    throw new ConflictException("CPF já cadastrado");
                }
                user.setCpf(cpf);
            } else if ("crn".equals(key)) {
                String crn = (String) value;
                if (!user.getCrn().equals(crn) && userRepository.findByCrn(crn).isPresent()) {
                    throw new ConflictException("CRN já cadastrado");
                }
                user.setCrn(crn);
            } else if ("senha".equals(key)) {
                user.setSenha(passwordEncoder.encode((String) value));
            } else if ("foto".equals(key)) {
                user.setFoto((String) value);
            }
        }

        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        verificarPropriedade(id);
        UserModel user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        user.setDeletedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    /**
     * Garante que o usuário autenticado só acesse/modifique seus próprios dados.
     * Compara o id solicitado com o id do usuário logado (A01 — IDOR prevention).
     */
    private void verificarPropriedade(Integer id) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        UserModel logado = userRepository.findByEmailIgnoreCase(emailLogado)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuário não autenticado"));
        if (!logado.getId().equals(id)) {
            throw new AccessDeniedException("Acesso negado: você só pode acessar seus próprios dados");
        }
    }

    public UserModel login(LoginRequestDTO dto) {
        if (userRepository.findByEmailIgnoreCase(dto.getEmail()).isPresent()) {
            UserModel user = userRepository.findByEmailIgnoreCase(dto.getEmail()).get();
            if (!passwordEncoder.matches(dto.getSenha(), user.getSenha())) {
                throw new ConflictException("Senha incorreta");
            }
            return user;
        } else {
            throw new NotFoundException("Usuário não encontrado");
        }
    }

    public void changePassword(String currentPassword, String newPassword) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        UserModel user = userRepository.findByEmailIgnoreCase(emailLogado)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado"));

        if (!passwordEncoder.matches(currentPassword, user.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        user.setSenha(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
