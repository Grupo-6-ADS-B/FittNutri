package fitt_nutri.example.demo.dto.request;

import lombok.Data;

@Data
public class    MealItemDTO {
    private String alimento;
    private Double quantidade;
    private String unidade;
}
