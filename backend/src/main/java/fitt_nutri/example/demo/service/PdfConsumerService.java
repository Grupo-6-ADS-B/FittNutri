package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.RabbitMQConfig;
import fitt_nutri.example.demo.dto.PdfGenerationMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Slf4j
@Service
@Profile("prod")
@RequiredArgsConstructor
public class PdfConsumerService {

    private final MealService mealService;
    private final S3Service s3Service;

    @RabbitListener(queues = RabbitMQConfig.PDF_QUEUE)
    public void consumePdfGeneration(PdfGenerationMessageDTO message) {
        try {
            log.info("Consumindo mensagem da fila para agendamento: {}", message.getAgendamentoId());

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                message.getNutricionistaEmail(), null, Collections.emptyList()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            byte[] pdf = mealService.generateDietPdf(message.getPatientId());

            s3Service.uploadPdf(
                pdf,
                message.getPatientId(),
                message.getPatientName(),
                message.getAgendamentoId(),
                message.getDataAgendamento()
            );

            log.info("PDF gerado e enviado para S3 com sucesso. Agendamento: {}", message.getAgendamentoId());

        } catch (Exception e) {
            log.error("Erro ao processar PDF para agendamento: {}", message.getAgendamentoId(), e);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
