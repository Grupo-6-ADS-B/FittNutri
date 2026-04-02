package fitt_nutri.example.demo.config;

import fitt_nutri.example.demo.service.AutenticacaoService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
@Component
@RequiredArgsConstructor
public class AutenticacaoFilter extends OncePerRequestFilter {
    // URLs públicas (mesmo array do SecurityConfig)
    private static final List<String> URLS_PUBLICAS = Arrays.asList(
        "/users/google-login",
        "/users/login",
        "/users",
        "/swagger-ui",
        "/swagger-ui.html",
        "/v3/api-docs",
        "/swagger-resources",
        "/webjars",
        "/h2-console",
        "/forms",
        "/error",
        "/actuator/health",
        "/actuator/prometheus"
    );

    private static final Logger LOGGER = LoggerFactory.getLogger(AutenticacaoFilter.class);

    private final AutenticacaoService autenticacaoService;
    private final GerenciadorTokenJwt jwtTokenManager;

    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Verifica se a rota é pública
        boolean isPublic = URLS_PUBLICAS.stream().anyMatch(publicUrl ->
            path.equals(publicUrl) || path.startsWith(publicUrl + "/")
        );

        // Permite POST em /users (criação de usuário) e /users/google-login
        if ((path.equals("/users") || path.equals("/users/google-login")) && method.equals("POST")) {
            isPublic = true;
        }

        LOGGER.info("[AuthFilter] Path: {} | Method: {} | isPublic: {}", path, method, isPublic);
        if (isPublic) {
            LOGGER.info("[AuthFilter] Liberando autenticação para {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        String username = null;

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);

            try {
                username = jwtTokenManager.getUsernameFromToken(token);

            } catch (ExpiredJwtException e) {
                response.setContentType("application/json");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Token expirado. Faça login novamente.\"}");
                return;
            } catch (Exception e) {
                response.setContentType("application/json");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Token inválido.\"}");
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = autenticacaoService.loadUserByUsername(username);
            if (jwtTokenManager.validateToken(token, userDetails)) {
                String role = jwtTokenManager.getRoleFromToken(token);
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                List.of(() -> role)
                        );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }
}
