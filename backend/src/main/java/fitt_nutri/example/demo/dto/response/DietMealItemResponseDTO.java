package fitt_nutri.example.demo.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DietMealItemResponseDTO {
    private Integer id;
    private String alimento; 
    private String descricao;
    private BigDecimal quantidade;
    private String unidade;
    private String observacao;
}