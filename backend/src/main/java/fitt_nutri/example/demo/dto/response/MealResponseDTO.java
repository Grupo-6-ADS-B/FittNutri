package fitt_nutri.example.demo.dto.response;

import lombok.Data;
import lombok.Data;

import java.util.List;

@Data
public class MealResponseDTO {
    private Integer id;
    private String horario;
    private String descricao;
    private String observacao;
    private List<MealItemResponseDTO> alimentos;
}


