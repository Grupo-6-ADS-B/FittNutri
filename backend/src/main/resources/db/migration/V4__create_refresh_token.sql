-- V4: Tabela de refresh tokens para rotação segura de sessão (A02/A07 OWASP)
CREATE TABLE IF NOT EXISTS refresh_token (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    token      VARCHAR(255) NOT NULL UNIQUE,
    user_id    INT          NOT NULL,
    expiry_date TIMESTAMP   NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_refresh_token_token ON refresh_token(token);
CREATE INDEX idx_refresh_token_user_id ON refresh_token(user_id);
