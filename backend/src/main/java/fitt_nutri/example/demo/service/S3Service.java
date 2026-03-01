package fitt_nutri.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@org.springframework.context.annotation.Profile("prod")
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.region}")
    private String region;

    public String uploadPdf(byte[] pdfBytes, Integer patientId, String patientName, Integer agendamentoId, String dataAgendamento) {
        String nomeFormatado = patientName.toUpperCase().replace(" ", "-");
        String key = "pacientes/" + nomeFormatado + "/consultas/" + dataAgendamento + "-" + agendamentoId + ".pdf";

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("application/pdf")
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(pdfBytes));

        String url = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
        // Log removido para evitar exposição de informações sensíveis
        return url;
    }
}
