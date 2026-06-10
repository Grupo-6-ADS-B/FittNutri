package fitt_nutri.example.demo.config;

import fitt_nutri.example.demo.service.AutenticacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AutenticacaoService autenticacaoService;
    private final AutenticacaoEntryPoint autenticacaoEntryPoint;
    private final AutenticacaoFilter autenticacaoFilter;

    // Swagger e H2 console são permitidos apenas no perfil local/dev.
    // Em produção são desabilitados via application-prod.properties.
    private static final String[] URLS_PUBLICAS = {
            "/users/login",
            "/users/refresh-token",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**",
            "/forms/**",
            "/error",
            "/actuator/health",
            "/actuator/prometheus"
    };

    // H2 Console liberado apenas para localhost (127.0.0.1)
    // Em produção fica bloqueado automaticamente
    private static final String[] URLS_DEV = {
        "/h2-console/**"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .authenticationProvider(new AutenticacaoProvider(autenticacaoService, passwordEncoder()))
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // AVISO: frameOptions desabilitado apenas para H2 Console em dev — remover em produção
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/users/google-login").permitAll()
                .requestMatchers(URLS_PUBLICAS).permitAll()
                .requestMatchers(URLS_DEV)
                    .access(new WebExpressionAuthorizationManager(
                        "hasIpAddress('127.0.0.1')"
                    ))
                .requestMatchers(HttpMethod.POST, "/users").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint(autenticacaoEntryPoint))
            .sessionManagement(management -> management
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(autenticacaoFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    // 💡 SUGESTÃO OWASP A05 - Credenciais hardcoded:
    // As credenciais do banco estão fixas no application.properties.
    // Quando possível, mover para variáveis de ambiente:
    // spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
    // spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
    // Criar arquivo .env na raiz e adicionar .env no .gitignore.
    // Impacto: Médio - requer alinhamento com toda a equipe.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://fittnutri.duckdns.org",
                "https://fittnutri.site",
                "https://www.fittnutri.site"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
