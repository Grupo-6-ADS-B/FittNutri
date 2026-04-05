package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.GerenciadorTokenJwt;
import fitt_nutri.example.demo.dto.login.LoginListDTO;
import fitt_nutri.example.demo.dto.login.LoginMapperDTO;
import fitt_nutri.example.demo.dto.login.LoginTokenDTO;
import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final GerenciadorTokenJwt gerenciadorTokenJwt;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public void criar(UserModel novoUser){
        if (userRepository.existsByEmail(novoUser.getEmail())) {
            throw new ConflictException("Email já cadastrado");
        }

        if (userRepository.existsByCpf(novoUser.getCpf())) {
            throw new ConflictException("CPF já cadastrado");
        }

        if (userRepository.existsByCrn(novoUser.getCrn())) {
            throw new ConflictException("CRN já cadastrado");
        }

        if (novoUser.getSenha() != null && !novoUser.getSenha().isEmpty()) {
            String senhaCriptografada = passwordEncoder.encode(novoUser.getSenha());
            novoUser.setSenha(senhaCriptografada);
        }

        try {
            userRepository.save(novoUser);
            userRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            String causeMessage = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
            String normalized = causeMessage == null ? "" : causeMessage.toLowerCase();

            if (normalized.contains("cpf")) {
                throw new ConflictException("CPF já cadastrado");
            }

            if (normalized.contains("email")) {
                throw new ConflictException("Email já cadastrado");
            }

            if (normalized.contains("crn")) {
                throw new ConflictException("CRN já cadastrado");
            }

            throw new ConflictException("Dados já cadastrados");
        }
    }

    public LoginTokenDTO autenticar(UserModel user){
        final UsernamePasswordAuthenticationToken credentials = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getSenha());
        final Authentication authentication = authenticationManager.authenticate(credentials);

        UserModel userAuthenticated = userRepository.findByEmail(user.getEmail()).orElseThrow(() -> new ResponseStatusException(404,"Email do usuário não encontrado",null));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        final String token = gerenciadorTokenJwt.generateToken(authentication);

        return LoginMapperDTO.of(userAuthenticated,token);
    }

    public List<LoginListDTO> listarUsuarios(){
        List<UserModel> users = userRepository.findAll();
        return users.stream().map(LoginMapperDTO::of).toList();
    }

    public String gerarToken(UserModel user) {
        org.springframework.security.core.userdetails.User springUser =
            new org.springframework.security.core.userdetails.User(
                user.getEmail(), "", java.util.List.of(() -> user.getRole()));
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication =
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                springUser, null, springUser.getAuthorities());
        return gerenciadorTokenJwt.generateToken(authentication);
    }

    public java.util.Optional<UserModel> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void atualizarSenha(UserModel user, String novaSenha) {
        String senhaCriptografada = passwordEncoder.encode(novaSenha);
        user.setSenha(senhaCriptografada);
        userRepository.save(user);
    }
}
