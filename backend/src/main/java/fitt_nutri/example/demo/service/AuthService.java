package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.AcessDTO;
import fitt_nutri.example.demo.dto.request.LoginRequestDTO;
import fitt_nutri.example.demo.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public AcessDTO login(LoginRequestDTO loginRequestDTO){
        try {
            UsernamePasswordAuthenticationToken userAuth = new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getSenha());

            Authentication authentication = authenticationManager.authenticate(userAuth);

            UserDetailsImpl userAuthenticated = (UserDetailsImpl) authentication.getPrincipal();

            String token = jwtUtils.generateTokenFromUserDetailsImpl(userAuthenticated);

            AcessDTO acessDTO = new AcessDTO(token);

            return acessDTO;
        }catch (BadCredentialsException e){
            throw new BadCredentialsException("Credenciais inválidas");
        }
    }
}
