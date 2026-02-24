package fitt_nutri.example.demo.dto;

import java.io.Serializable;

public class PdfGenerationMessageDTO implements Serializable {

    private Integer patientId;
    private String patientName;
    private Integer agendamentoId;
    private String dataAgendamento;

    public PdfGenerationMessageDTO() {}

    public PdfGenerationMessageDTO(Integer patientId, String patientName, Integer agendamentoId, String dataAgendamento) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.agendamentoId = agendamentoId;
        this.dataAgendamento = dataAgendamento;
    }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getAgendamentoId() { return agendamentoId; }
    public void setAgendamentoId(Integer agendamentoId) { this.agendamentoId = agendamentoId; }

    public String getDataAgendamento() { return dataAgendamento; }
    public void setDataAgendamento(String dataAgendamento) { this.dataAgendamento = dataAgendamento; }
}
