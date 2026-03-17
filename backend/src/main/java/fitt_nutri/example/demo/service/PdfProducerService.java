package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.config.RabbitMQConfig;
import fitt_nutri.example.demo.dto.PdfGenerationMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("prod")
@RequiredArgsConstructor
public class PdfProducerService {

    private final RabbitTemplate rabbitTemplate;

    public void requestPdfGeneration(Integer patientId, String patientName, Integer agendamentoId, String dataAgendamento) {
        String nutricionistaEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        PdfGenerationMessageDTO message = new PdfGenerationMessageDTO(patientId, patientName, agendamentoId, dataAgendamento, nutricionistaEmail);
        rabbitTemplate.convertAndSend(RabbitMQConfig.PDF_QUEUE, message);
        log.info("Mensagem publicada na fila para paciente: {} consulta: {}", patientId, agendamentoId);
    }
}
