package fitt_nutri.example.demo.exceptions;

import fitt_nutri.example.demo.config.SecurityAuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Captura centralizada de exceções — A05 / A09 OWASP.
 *
 * Garante que:
 * - Nenhum stack trace vaze para o cliente
 * - Violações de acesso e erros de validação sejam logadas para auditoria
 * - Todas as respostas de erro sigam o mesmo formato JSON
 */
@Slf4j
@RequiredArgsConstructor
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final SecurityAuditLogger securityAuditLogger;

    // ------------------------------------------------------------------
    // 404 — recurso não encontrado
    // ------------------------------------------------------------------

    @ExceptionHandler({NotFoundException.class, NotFoundData.class,
                       NotFoundUser.class, ResourceNotFoundException.class, DateNotFound.class})
    public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // ------------------------------------------------------------------
    // 409 — conflito (email/CPF duplicado)
    // ------------------------------------------------------------------

    @ExceptionHandler({ConflictException.class, AlreadyExistingData.class})
    public ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    // ------------------------------------------------------------------
    // 400 — dados inválidos
    // ------------------------------------------------------------------

    @ExceptionHandler({InvalidDataException.class, InvalidRequest.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** Bean Validation (@Valid) — retorna mapa campo → mensagem */
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
    // 403 — acesso negado (A01 OWASP — log para auditoria)
    // ------------------------------------------------------------------

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : "anônimo";
        securityAuditLogger.accessDenied(email, ex.getMessage());
        return build(HttpStatus.FORBIDDEN, "Acesso negado");
    }

    // ------------------------------------------------------------------
    // ResponseStatusException (lançada manualmente com status HTTP)
    // ------------------------------------------------------------------

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        return build(HttpStatus.valueOf(ex.getStatusCode().value()), ex.getReason());
    }

    // ------------------------------------------------------------------
    // 500 — erro inesperado (log completo, mensagem genérica ao cliente)
    // ------------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("[ERRO INTERNO] {}: {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno. Contate o suporte.");
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(status.value(), status.getReasonPhrase(), message, null));
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message,
                                                 Map<String, String> detalhes) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(status.value(), status.getReasonPhrase(), message, detalhes));
    }

    public record ErrorResponse(
            int status,
            String erro,
            String mensagem,
            Map<String, String> detalhes
    ) {}
}
