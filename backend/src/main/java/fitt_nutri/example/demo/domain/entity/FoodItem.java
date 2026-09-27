package fitt_nutri.example.demo.domain.entity;

import lombok.Data;

@Data
public class FoodItem {
    private Integer id;
    private String nome;

    private Double energiaKcal;
    private Double proteina;
    private Double lipideos;
    private Double carboidrato;
    private Double fibra;
}
