package fitt_nutri.example.demo.dto;

import java.io.Serializable;
import org.springframework.context.annotation.Profile;

@Profile({"prod", "dev"})
public class PdfGenerationMessageDTO implements Serializable {

    private Integer patientId;
    private String patientName;
    private Integer agendamentoId;
    private String dataAgendamento;
    private String nutricionistaEmail;

    public PdfGenerationMessageDTO() {}

    public PdfGenerationMessageDTO(Integer patientId, String patientName, Integer agendamentoId, String dataAgendamento, String nutricionistaEmail) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.agendamentoId = agendamentoId;
        this.dataAgendamento = dataAgendamento;
        this.nutricionistaEmail = nutricionistaEmail;
    }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getAgendamentoId() { return agendamentoId; }
    public void setAgendamentoId(Integer agendamentoId) { this.agendamentoId = agendamentoId; }

    public String getDataAgendamento() { return dataAgendamento; }
    public void setDataAgendamento(String dataAgendamento) { this.dataAgendamento = dataAgendamento; }

    public String getNutricionistaEmail() { return nutricionistaEmail; }
    public void setNutricionistaEmail(String nutricionistaEmail) { this.nutricionistaEmail = nutricionistaEmail; }
}
