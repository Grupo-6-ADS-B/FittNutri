package fitt_nutri.example.demo.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final Resend resend;

    @Value("${email.from}")
    private String from;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${email.contact:suporte.fittnutri@gmail.com}")
    private String contactDestination;

    public void sendPasswordRecoveryEmail(String to, String token) {
        String resetUrl = frontendUrl + "/resetar-senha?token=" + token;

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to(List.of(to))
                .subject("Recuperação de senha — FittNutri")
                .html(buildPasswordResetHtml(resetUrl))
                .build();

        try {
            resend.emails().send(params);
            log.info("[email] recuperação de senha enviada para {}", to);
        } catch (ResendException e) {
            log.error("[email] falha ao enviar recuperação de senha para {}: {}", to, e.getMessage());
        }
    }

    public void sendContactNotificationEmail(String nome, String emailRemetente, String mensagem) {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to(List.of(contactDestination))
                .replyTo(List.of(emailRemetente))
                .subject("Nova mensagem de contato — " + nome)
                .html(buildContactHtml(nome, emailRemetente, mensagem))
                .build();
        try {
            resend.emails().send(params);
            log.info("[email] notificação de contato enviada para {}", contactDestination);
        } catch (ResendException e) {
            log.error("[email] falha ao enviar notificação de contato: {}", e.getMessage());
        }
    }

    private String buildContactHtml(String nome, String emailRemetente, String mensagem) {
        return """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head><meta charset="UTF-8"></head>
                <body style="font-family:sans-serif;color:#1f2937;padding:32px;max-width:560px;margin:0 auto;">
                  <h2 style="color:#16a34a;margin-bottom:4px;">FittNutri</h2>
                  <p style="color:#6b7280;font-size:13px;margin-top:0;">Nova mensagem recebida pelo formulário de contato</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
                  <p><strong>Nome:</strong> %s</p>
                  <p><strong>Email:</strong> <a href="mailto:%s" style="color:#16a34a;">%s</a></p>
                  <p><strong>Mensagem:</strong></p>
                  <p style="background:#f9fafb;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;white-space:pre-wrap;">%s</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                  <p style="color:#9ca3af;font-size:11px;">© FittNutri — Responda diretamente a este email para contatar o remetente.</p>
                </body>
                </html>
                """.formatted(nome, emailRemetente, emailRemetente, mensagem);
    }

    private String buildPasswordResetHtml(String resetUrl) {
        return """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head><meta charset="UTF-8"></head>
                <body style="font-family:sans-serif;color:#1f2937;padding:32px;max-width:560px;margin:0 auto;">
                  <h2 style="color:#16a34a;margin-bottom:4px;">FittNutri</h2>
                  <p style="color:#6b7280;font-size:13px;margin-top:0;">Plataforma Inteligente para Nutricionistas</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
                  <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                  <p>Clique no botão abaixo para criar uma nova senha:</p>
                  <a href="%s"
                     style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;
                            border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
                    Redefinir senha
                  </a>
                  <p style="color:#6b7280;font-size:13px;">O link expira em <strong>1 hora</strong>.</p>
                  <p style="color:#6b7280;font-size:13px;">Se você não solicitou a redefinição, ignore este email — sua senha permanece a mesma.</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                  <p style="color:#9ca3af;font-size:11px;">© FittNutri</p>
                </body>
                </html>
                """.formatted(resetUrl);
    }
}
