package fitt_nutri.example.demo.dto.request;

import fitt_nutri.example.demo.model.AnthropometricDataModel;
import fitt_nutri.example.demo.model.DataCircleModel;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

@Data
public class ConsultaPacienteRequestDTO {

    private Integer pacienteId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataConsulta;

    private AnthropometricDataModel antropometria;
    private DataCircleModel circunferencia;
}
