package fitt_nutri.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.region}")
    private String region;

    public String uploadPdf(byte[] pdfBytes, Integer patientId) {
        String key = "pacientes/" + patientId + "/dieta.pdf";

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("application/pdf")
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(pdfBytes));

        String url = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
        System.out.println("PDF enviado para S3: " + url);
        return url;
    }
}
