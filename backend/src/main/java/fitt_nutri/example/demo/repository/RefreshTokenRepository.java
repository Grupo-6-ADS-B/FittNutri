package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.RefreshTokenModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenModel, Long> {

    Optional<RefreshTokenModel> findByTokenAndRevokedFalse(String token);

    @Modifying
    @Query("UPDATE RefreshTokenModel r SET r.revoked = true WHERE r.user.id = :userId AND r.revoked = false")
    void revokeAllByUserId(Integer userId);
}
