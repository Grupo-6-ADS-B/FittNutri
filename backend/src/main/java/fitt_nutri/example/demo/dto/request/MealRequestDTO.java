package fitt_nutri.example.demo.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class MealRequestDTO {
    private String descricao;
    private String horario;
    private String observacao;
    private List<MealItemDTO> alimentos;
}