package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.RabbitMQConfig;
import fitt_nutri.example.demo.dto.PdfGenerationMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PdfConsumerService {

    private final MealService mealService;
    private final S3Service s3Service;

    @RabbitListener(queues = RabbitMQConfig.PDF_QUEUE)
    public void consumePdfGeneration(PdfGenerationMessageDTO message) {
        try {
            System.out.println("Consumindo mensagem para paciente: " + message.getPatientId());

            byte[] pdf = mealService.generateDietPdf(message.getPatientId());

            String url = s3Service.uploadPdf(pdf, message.getPatientId());

            System.out.println("PDF gerado e enviado para S3: " + url);

        } catch (Exception e) {
            System.err.println("Erro ao processar PDF: " + e.getMessage());
        }
    }
}
