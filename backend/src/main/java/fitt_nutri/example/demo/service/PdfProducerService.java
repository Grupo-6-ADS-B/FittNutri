package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.RabbitMQConfig;
import fitt_nutri.example.demo.dto.PdfGenerationMessageDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"prod", "dev"})
@RequiredArgsConstructor
public class PdfProducerService {

    private static final Logger logger =
        LoggerFactory.getLogger(PdfProducerService.class);

    private final RabbitTemplate rabbitTemplate;

    public void requestPdfGeneration(Integer patientId, String patientName, Integer agendamentoId, String dataAgendamento) {
        PdfGenerationMessageDTO message = new PdfGenerationMessageDTO(patientId, patientName, agendamentoId, dataAgendamento);
        rabbitTemplate.convertAndSend(RabbitMQConfig.PDF_QUEUE, message);
        logger.info("Mensagem publicada na fila - paciente: {} consulta: {}",
            patientId, agendamentoId);
    }
}
