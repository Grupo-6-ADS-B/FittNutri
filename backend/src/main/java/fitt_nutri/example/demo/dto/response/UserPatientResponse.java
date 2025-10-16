package fitt_nutri.example.demo.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserPatientResponse {

    private Integer id;
    private String nome;
    private LocalDate dataNascimento;
    private String sexo;
    private String estadoCivil;
    private LocalDate dataConsulta;
    private String motivoConsulta;
    private String comorbidade;
    private Integer frequenciaAtividadeFisica;
}
