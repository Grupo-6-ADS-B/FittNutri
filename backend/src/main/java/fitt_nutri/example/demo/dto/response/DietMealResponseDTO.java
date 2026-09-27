package fitt_nutri.example.demo.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class DietMealResponseDTO {
    private Integer id;
    private String horario;
    private String nome;
    private String observacao;
    private List<DietMealItemResponseDTO> itens;
}