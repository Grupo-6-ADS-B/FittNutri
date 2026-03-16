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

}
