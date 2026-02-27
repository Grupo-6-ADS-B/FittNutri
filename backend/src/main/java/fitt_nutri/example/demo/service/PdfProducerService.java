package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.RabbitMQConfig;
import fitt_nutri.example.demo.dto.PdfGenerationMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@org.springframework.context.annotation.Profile("prod")
@RequiredArgsConstructor
public class PdfProducerService {

    private final RabbitTemplate rabbitTemplate;

    public void requestPdfGeneration(Integer patientId, String patientName, Integer agendamentoId, String dataAgendamento) {
        PdfGenerationMessageDTO message = new PdfGenerationMessageDTO(patientId, patientName, agendamentoId, dataAgendamento);
        rabbitTemplate.convertAndSend(RabbitMQConfig.PDF_QUEUE, message);
        System.out.println("Mensagem publicada na fila para paciente: " + patientId + " consulta: " + agendamentoId);
    }
}
