package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.model.RefreshTokenModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository repository;

    @Value("${jwt.refresh-validity:604800000}")
    private long refreshValidity; // 7 dias em ms (padrão)

    @Transactional
    public RefreshTokenModel createRefreshToken(UserModel user) {
        // Revogar tokens anteriores do mesmo usuário
        repository.revokeAllByUserId(user.getId());

        RefreshTokenModel refreshToken = new RefreshTokenModel();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshValidity));
        refreshToken.setRevoked(false);

        return repository.save(refreshToken);
    }

    public Optional<RefreshTokenModel> findByToken(String token) {
        return repository.findByTokenAndRevokedFalse(token);
    }

    public RefreshTokenModel verifyExpiration(RefreshTokenModel token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            token.setRevoked(true);
            repository.save(token);
            throw new RuntimeException("Refresh token expirado. Faça login novamente.");
        }
        return token;
    }

    @Transactional
    public void revokeByUserId(Integer userId) {
        repository.revokeAllByUserId(userId);
    }
}
