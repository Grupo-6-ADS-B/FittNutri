package fitt_nutri.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${spring.mail.username:no-reply@fittnutri.com}")
    private String from;

    public void sendPasswordRecoveryEmail(String to, String token) {
        String subject = "Recuperação de senha - FittNutri";
        String resetUrl = "http://localhost:5173/resetar-senha?token=" + token;
        String text = "Olá!\n\nRecebemos uma solicitação para redefinir sua senha. Clique no link abaixo para criar uma nova senha:\n" + resetUrl + "\n\nSe você não solicitou, ignore este e-mail.";

        // Log do email que seria enviado (até que as dependências sejam carregadas)
        System.out.println("[EMAIL] Para: " + to);
        System.out.println("[EMAIL] Assunto: " + subject);
        System.out.println("[EMAIL] Corpo: " + text);
        System.out.println("[EMAIL] De: " + from);
    }
}



