package fitt_nutri.example.demo.dto.request;

import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.DataCircleModel;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ConsultaPacienteRequestDTO {

    private Integer pacienteId;
    private LocalDate dataConsulta;
    private String motivoConsulta;

    private AnthropometricDataModel antropometria;
    private DataCircleModel circunferencia;
}
