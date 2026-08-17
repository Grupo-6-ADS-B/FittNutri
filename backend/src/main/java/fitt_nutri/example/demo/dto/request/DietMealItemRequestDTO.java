package fitt_nutri.example.demo.dto.request;

import lombok.Data;

@Data
public class DietMealItemRequestDTO {
    private Integer alimentoId;
    private String descricao;
    private Double quantidade;
    private String unidade;
    private String observacao;
}