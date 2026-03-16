package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.GerenciadorTokenJwt;
import fitt_nutri.example.demo.config.LoginRateLimiter;
import fitt_nutri.example.demo.config.SecurityAuditLogger;
import fitt_nutri.example.demo.dto.login.LoginListDTO;
import fitt_nutri.example.demo.dto.login.LoginMapperDTO;
import fitt_nutri.example.demo.dto.login.LoginTokenDTO;
import fitt_nutri.example.demo.model.RefreshTokenModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final GerenciadorTokenJwt gerenciadorTokenJwt;
    private final AuthenticationManager authenticationManager;
    private final LoginRateLimiter loginRateLimiter;
    private final SecurityAuditLogger securityAuditLogger;
    private final RefreshTokenService refreshTokenService;

    public void criar(UserModel novoUser){

        String senhaCriptografada = passwordEncoder.encode(novoUser.getSenha());
        novoUser.setSenha(senhaCriptografada);

        userRepository.save(novoUser);
    }

    public LoginTokenDTO autenticar(UserModel user){
        loginRateLimiter.verificar(user.getEmail());
        final UsernamePasswordAuthenticationToken credentials = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getSenha());

        final Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(credentials);
        } catch (BadCredentialsException ex) {
            securityAuditLogger.loginFailure(user.getEmail(), "Credenciais inválidas");
            throw ex;
        }

        UserModel userAuthenticated = userRepository.findByEmail(user.getEmail()).orElseThrow(() -> new ResponseStatusException(404,"Email do usuário não encontrado",null));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        final String token = gerenciadorTokenJwt.generateToken(authentication);
        RefreshTokenModel refreshToken = refreshTokenService.createRefreshToken(userAuthenticated);

        securityAuditLogger.loginSuccess(user.getEmail());

        LoginTokenDTO loginTokenDTO = LoginMapperDTO.of(userAuthenticated, token);
        loginTokenDTO.setRefreshToken(refreshToken.getToken());
        return loginTokenDTO;
    }

    public List<LoginListDTO> listarUsuarios(){
        List<UserModel> users = userRepository.findAll();
        return users.stream().map(LoginMapperDTO::of).toList();
    }
}
