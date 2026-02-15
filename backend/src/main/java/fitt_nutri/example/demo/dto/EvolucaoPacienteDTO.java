package fitt_nutri.example.demo.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EvolucaoPacienteDTO {

    private LocalDate dataConsulta;

    private Double peso;
    private Double imc;
    private Double gordura;
    private Double gorduraVisceral;
    private Double massaMuscular;
    private Double altura;
    private Double idadeMetabolica;
    private Double taxaMetabolicaBasal;
    private String atividade;

    private Double cintura;
    private Double abdominal;
    private Double quadril;
    private Double braco;
    private Double coxa;
    private Double panturrilha;
    private Double pesoIdeal;
    private Double pulso;
}
