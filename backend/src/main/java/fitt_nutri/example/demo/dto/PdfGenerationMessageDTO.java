package fitt_nutri.example.demo.dto;

import java.io.Serializable;

public class PdfGenerationMessageDTO implements Serializable {

    private Integer patientId;
    private String patientName;

    public PdfGenerationMessageDTO() {}

    public PdfGenerationMessageDTO(Integer patientId, String patientName) {
        this.patientId = patientId;
        this.patientName = patientName;
    }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
}
