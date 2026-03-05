package fitt_nutri.example.demo.domain.port.in;

public interface GenerateDietPdfUseCase {
    byte[] execute(Integer patientId) throws Exception;
}