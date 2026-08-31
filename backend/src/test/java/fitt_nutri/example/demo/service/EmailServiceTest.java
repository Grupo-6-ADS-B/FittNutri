package fitt_nutri.example.demo.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * O SDK do Resend nem sempre lança ResendException para falhas da API (ex.: domínio de
 * envio não verificado chega como RuntimeException genérica, "Failed to send email: 422 ...").
 * Nenhum método de envio pode deixar isso escapar — quem chama (ex.: SchedulingService,
 * dentro de uma transação) não pode ter a operação inteira revertida só porque o e-mail falhou.
 */
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private Resend resend;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(resend);
    }

    @Test
    @DisplayName("sendAppointmentConfirmationEmail - RuntimeException genérica do SDK não deve propagar")
    void sendAppointmentConfirmationEmail_RuntimeExceptionDoSdkNaoPropaga() throws Exception {
        when(resend.emails().send(any(CreateEmailOptions.class)))
                .thenThrow(new RuntimeException("Failed to send email: 403 domain not verified"));

        assertDoesNotThrow(() -> emailService.sendAppointmentConfirmationEmail(
                "paciente@example.com", "Paciente", "Nutri",
                LocalDateTime.of(2026, 9, 1, 14, 30), "Observação"));
    }

    @Test
    @DisplayName("sendAppointmentReminderEmail - RuntimeException genérica do SDK não deve propagar")
    void sendAppointmentReminderEmail_RuntimeExceptionDoSdkNaoPropaga() throws Exception {
        when(resend.emails().send(any(CreateEmailOptions.class)))
                .thenThrow(new RuntimeException("Failed to send email: 429 rate limited"));

        assertDoesNotThrow(() -> emailService.sendAppointmentReminderEmail(
                "paciente@example.com", "Paciente", "Nutri", LocalDateTime.of(2026, 9, 1, 14, 30)));
    }
}
