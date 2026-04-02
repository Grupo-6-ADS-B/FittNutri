package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.adapter.UserAdapter;
import fitt_nutri.example.demo.config.GerenciadorTokenJwt;
import fitt_nutri.example.demo.dto.login.*;
import fitt_nutri.example.demo.dto.request.UserRequestDTO;
import fitt_nutri.example.demo.dto.response.UserResponseDTO;
import fitt_nutri.example.demo.model.RefreshTokenModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.service.LoginService;
import fitt_nutri.example.demo.service.RefreshTokenService;
import fitt_nutri.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.time.LocalDateTime;
import java.util.UUID;
import fitt_nutri.example.demo.model.PasswordResetToken;
import fitt_nutri.example.demo.repository.PasswordResetTokenRepository;
import fitt_nutri.example.demo.service.EmailService;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "CRUD de usuários")
public class UserController {

    private final UserAdapter adapter;
    private final LoginService service;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final GerenciadorTokenJwt gerenciadorTokenJwt;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;


    @PostMapping("/recover-password")
    public ResponseEntity<?> recoverPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "E-mail é obrigatório"));
        }
        // Verifica se existe usuário com esse e-mail
        var userOpt = service.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuário não encontrado"));
        }
        // Remove tokens antigos
        passwordResetTokenRepository.deleteByEmail(email);
        // Gera token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);
        try {
            emailService.sendPasswordRecoveryEmail(email, token);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erro ao enviar e-mail: " + e.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", "E-mail de recuperação enviado!"));
    }

    @PostMapping
    public ResponseEntity<Void> createUser(@Valid @RequestBody LoginCreateDTO dto) {
        final UserModel user = LoginMapperDTO.of(dto);
        service.criar(user);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginTokenDTO> loginUser(@Valid @RequestBody LoginRequestDTO dto) {
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        final UserModel user = LoginMapperDTO.of(dto);
        LoginTokenDTO loginTokenDTO = service.autenticar(user);
        return ResponseEntity.ok(loginTokenDTO);
    }


    @GetMapping
    @SecurityRequirement(name = "Bearer")
    public ResponseEntity<List<LoginListDTO>> getAllUsers() {
        List<LoginListDTO> users = service.listarUsuarios();
        if(users.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Retorna dados do usuário autenticado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados do usuário"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    public ResponseEntity<?> getCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String namePrincipal = auth.getName();
                Integer userId = null;
                try {
                    userId = Integer.parseInt(namePrincipal);
                } catch (NumberFormatException e) {
                    var userOpt = service.getUserByEmail(namePrincipal);
                    if (userOpt.isPresent()) {
                        return ResponseEntity.ok(adapter.mapToResponse(userOpt.get()));
                    }
                }
                if (userId != null) {
                    return ResponseEntity.ok(adapter.getUserById(userId));
                }
            }
            return ResponseEntity.status(401).body(Map.of("error", "Não autenticado"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Erro ao obter usuário: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Busca dados do próprio usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso negado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(adapter.getUserById(id));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Busca dados do próprio usuário por email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso negado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(adapter.getUserByEmail(email));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('NUTRI')")
    @Operation(summary = "Atualiza usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Integer id, @Valid @RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(adapter.updateUser(id, dto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('NUTRI')")
    @Operation(summary = "Atualiza parcialmente um usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserResponseDTO> patchUser(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(adapter.patchUser(id, updates));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('NUTRI')")
    @Operation(summary = "Exclui usuário por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuário excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        adapter.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Gera novo access token a partir de um refresh token válido")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Novo token gerado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Refresh token inválido ou expirado")
    })
    public ResponseEntity<LoginTokenDTO> refreshToken(@RequestBody Map<String, String> request) {
        String requestRefreshToken = request.get("refreshToken");
        if (requestRefreshToken == null || requestRefreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        RefreshTokenModel refreshToken = refreshTokenService.findByToken(requestRefreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token não encontrado ou já revogado."));

        refreshTokenService.verifyExpiration(refreshToken);

        UserModel user = refreshToken.getUser();
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                : java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );

        String newAccessToken = gerenciadorTokenJwt.generateToken(authentication);
        RefreshTokenModel newRefreshToken = refreshTokenService.createRefreshToken(user);

        LoginTokenDTO tokenDTO = LoginMapperDTO.of(user, newAccessToken);
        tokenDTO.setRefreshToken(newRefreshToken.getToken());
        return ResponseEntity.ok(tokenDTO);
    }

    @PostMapping("/logout")
    @PreAuthorize("hasRole('NUTRI')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Revoga todos os refresh tokens do usuário (logout)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Logout realizado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    public ResponseEntity<Void> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserModel user = userService.getUserByEmail(email);
        refreshTokenService.revokeByUserId(user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/google-login")
    @Operation(summary = "Login com Google")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token Google inválido")
    })
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginDTO dto) {
        try {
            var payload = fitt_nutri.example.demo.util.GoogleTokenVerifierUtil.verify(dto.token);
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String sub = payload.getSubject();

            var userOpt = service.getUserByEmail(email);
            UserModel user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                user = new UserModel();
                user.setNome(name);
                user.setEmail(email);
                user.setSenha("");
                user.setCpf("GOOGLE-" + sub);
                user.setCrn("GOOGLE");
                user.setFoto(picture);
                service.criar(user);
            }

            String jwt = service.gerarToken(user);
            return ResponseEntity.ok(Map.of(
                "token", jwt,
                "id", user.getId(),
                "nome", user.getNome(),
                "email", user.getEmail(),
                "foto", user.getFoto()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Token Google inválido ou erro de autenticação: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Redefinir senha usando token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Senha redefinida com sucesso"),
            @ApiResponse(responseCode = "400", description = "Token inválido ou expirado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token e nova senha são obrigatórios"));
        }
        var tokenOpt = passwordResetTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Token inválido ou expirado"));
        }
        var resetToken = tokenOpt.get();
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            return ResponseEntity.status(400).body(Map.of("error", "Token expirado"));
        }
        var userOpt = service.getUserByEmail(resetToken.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuário não encontrado"));
        }
        var user = userOpt.get();
        service.atualizarSenha(user, newPassword);
        passwordResetTokenRepository.delete(resetToken);
        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso!"));
    }

}
