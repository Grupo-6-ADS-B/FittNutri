package fitt_nutri.example.demo.domain.entity;

import lombok.Data;

@Data
public class MealItem {
    private Integer id;
    private String alimento;
    private Double quantidade;
    private String unidade;
    private Integer foodItemId;
}