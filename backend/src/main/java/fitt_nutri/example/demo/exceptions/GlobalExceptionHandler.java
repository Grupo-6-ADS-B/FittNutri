package fitt_nutri.example.demo.exceptions;

import fitt_nutri.example.demo.config.SecurityAuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final SecurityAuditLogger securityAuditLogger;

    // ------------------------------------------------------------------
    // 404 — recurso/usuário não encontrado
    // ------------------------------------------------------------------
    @ExceptionHandler({
            NotFoundException.class,
            NotFoundData.class,
            NotFoundUser.class,
            ResourceNotFoundException.class,
            DateNotFound.class,
            UsernameNotFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException ex) {
        String message = ex instanceof UsernameNotFoundException
                ? "Usuário não encontrado"
                : ex.getMessage();

        return build(HttpStatus.NOT_FOUND, message);
    }

    // ------------------------------------------------------------------
    // 409 — conflito
    // ------------------------------------------------------------------
    @ExceptionHandler({
            ConflictException.class,
            AlreadyExistingData.class
    })
    public ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    // ------------------------------------------------------------------
    // 400 — dados inválidos
    // ------------------------------------------------------------------
    @ExceptionHandler({
            InvalidDataException.class,
            InvalidRequest.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // ------------------------------------------------------------------
    // 401 — autenticação inválida
    // ------------------------------------------------------------------
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Senha incorreta");
    }

    // ------------------------------------------------------------------
    // 400 — erros de validação do @Valid
    // ------------------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> erros = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "inválido",
                        (a, b) -> a
                ));

        return build(HttpStatus.BAD_REQUEST, "Erro de validação", erros);
    }

    // ------------------------------------------------------------------
    // 403 — acesso negado
    // ------------------------------------------------------------------
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : "anônimo";

        if (securityAuditLogger != null) {
            securityAuditLogger.accessDenied(email, ex.getMessage());
        }

        return build(HttpStatus.FORBIDDEN, "Acesso negado");
    }

    // ------------------------------------------------------------------
    // Exceções lançadas manualmente com status HTTP
    // ------------------------------------------------------------------
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : "Erro na requisição";
        return build(HttpStatus.valueOf(ex.getStatusCode().value()), message);
    }

    // ------------------------------------------------------------------
    // 500 — erro inesperado
    // ------------------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("[ERRO INTERNO] {}: {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor");
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        null
                ));
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, Map<String, String> detalhes) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        detalhes
                ));
    }

    public record ErrorResponse(
            int status,
            String erro,
            String mensagem,
            Map<String, String> detalhes
    ) {}
}