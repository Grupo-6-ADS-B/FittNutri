package fitt_nutri.example.demo.config;

import fitt_nutri.example.demo.service.AutenticacaoService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Objects;
import java.util.logging.Logger;

@RequiredArgsConstructor
public class AutenticacaoFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = (Logger) LoggerFactory.getLogger(AutenticacaoFilter.class);

    private final AutenticacaoService autenticacaoService;

    private final GerenciadorTokenJwt jwtTokenManager;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String username = null;
        String token = null;

        String requestTokenHeader = request.getHeader("Authorization");

        if (Objects.nonNull(requestTokenHeader) && requestTokenHeader.startsWith("Bearer ")) {
            token = requestTokenHeader.substring(7);
            try {
                username = jwtTokenManager.getUsernameFromToken(token);
            } catch (ExpiredJwtException e) {
                LOGGER.warning("[FALHA NA AUTENTICAÇÃO] - Token expirado. Usuário: "
                        + e.getClaims().getSubject() + " - " + e.getMessage());
                LOGGER.warning("[FALHA NA AUTENTICAÇÃO] - Stacktrace: " + Arrays.toString(e.getStackTrace()));

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        }


        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){
            addUsernameInContext(request,username, token);
        }
        filterChain.doFilter(request,response);
    }

    private void addUsernameInContext(HttpServletRequest request, String username, String token) {
        UserDetails userDetails = autenticacaoService.loadUserByUsername(username);

        if(jwtTokenManager.validateToken(token, userDetails)){
            UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
        }
    }
}
