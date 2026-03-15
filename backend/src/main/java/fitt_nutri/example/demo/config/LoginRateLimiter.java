package fitt_nutri.example.demo.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter de login por email usando Bucket4j (in-memory).
 *
 * Regra: máximo 5 tentativas por email a cada 1 minuto.
 * Se ultrapassado, lança 429 Too Many Requests.
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_TENTATIVAS = 5;
    private static final Duration JANELA = Duration.ofMinutes(1);

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public void verificar(String email) {
        Bucket bucket = buckets.computeIfAbsent(email, this::novoBucket);
        if (!bucket.tryConsume(1)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas tentativas de login. Aguarde 1 minuto e tente novamente."
            );
        }
    }

    private Bucket novoBucket(String email) {
        Bandwidth limite = Bandwidth.builder()
                .capacity(MAX_TENTATIVAS)
                .refillGreedy(MAX_TENTATIVAS, JANELA)
                .build();
        return Bucket.builder().addLimit(limite).build();
    }
}
