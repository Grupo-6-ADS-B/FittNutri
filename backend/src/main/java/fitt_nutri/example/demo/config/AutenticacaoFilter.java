package fitt_nutri.example.demo.config;

import fitt_nutri.example.demo.service.AutenticacaoService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class AutenticacaoFilter extends OncePerRequestFilter {

    private final AutenticacaoService autenticacaoService;
    private final GerenciadorTokenJwt jwtUtil;
    private final List<String> publicPaths;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public AutenticacaoFilter(AutenticacaoService autenticacaoService, GerenciadorTokenJwt jwtUtil, String[] publicPaths) {
        this.autenticacaoService = autenticacaoService;
        this.jwtUtil = jwtUtil;
        this.publicPaths = Arrays.asList(publicPaths);
    }

    private boolean isPublicPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String servlet = request.getServletPath();
        boolean matchUri = publicPaths.stream().anyMatch(p -> pathMatcher.match(p, uri));
        boolean matchServlet = publicPaths.stream().anyMatch(p -> pathMatcher.match(p, servlet));
        boolean match = matchUri || matchServlet;
        return match;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String authHeader = request.getHeader("Authorization");
        System.out.println("[AutenticacaoFilter] method=" + method + " requestURI=" + path + " AuthorizationPresent=" + (authHeader != null));

        // Se a rota é pública, não validar token aqui
        if (isPublicPath(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Se não houver header Authorization, deixa seguir (endpoints protegidos vão exigir auth mais adiante)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            String username = jwtUtil.getUsernameFromToken(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = autenticacaoService.loadUserByUsername(username);
                if (jwtUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("[AutenticacaoFilter] Authenticated user=" + username);
                } else {
                    System.out.println("[AutenticacaoFilter] Token invalid/expired for user=" + username);
                    SecurityContextHolder.clearContext();
                }
            }
        } catch (Exception ex) {
            System.out.println("[AutenticacaoFilter] Error parsing/validating token: " + ex.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
