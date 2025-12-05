package fitt_nutri.example.demo.dto.request;

import lombok.Data;

@Data
public class MealRequestDTO {
    private String horario;
    private String descricao;
    private String alimento;
    private Double quantidade;
    private String unidade;
    private String observacao;
    private Integer patientId;
}

