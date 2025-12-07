package fitt_nutri.example.demo.dto.request;

import fitt_nutri.example.demo.model.FoodItensModel;
import lombok.Data;

import java.util.List;

@Data
public class MealRequestDTO {
    private String descricao;
    private List<MealItemDTO> alimentos;
}