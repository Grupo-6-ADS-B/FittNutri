package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.RabbitMQConfig;
import fitt_nutri.example.demo.dto.PdfGenerationMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@org.springframework.context.annotation.Profile("prod")
@RequiredArgsConstructor
public class PdfConsumerService {

    private final MealService mealService;
    private final S3Service s3Service;

    @RabbitListener(queues = RabbitMQConfig.PDF_QUEUE)
    public void consumePdfGeneration(PdfGenerationMessageDTO message) {
        try {
        

            byte[] pdf = mealService.generateDietPdf(message.getPatientId());

            String url = s3Service.uploadPdf(
                pdf,
                message.getPatientId(),
                message.getPatientName(),
                message.getAgendamentoId(),
                message.getDataAgendamento()
            );

          
        } catch (Exception e) {
         
        }
    }
}
