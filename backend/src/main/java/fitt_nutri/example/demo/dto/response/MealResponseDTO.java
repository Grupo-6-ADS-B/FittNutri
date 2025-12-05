package fitt_nutri.example.demo.dto.response;

import lombok.Data;

@Data
public class MealResponseDTO {
    private Integer id;
    private String horario;
    private String descricao;
    private String alimento;
    private Double quantidade;
    private String unidade;
    private String observacao;
}

