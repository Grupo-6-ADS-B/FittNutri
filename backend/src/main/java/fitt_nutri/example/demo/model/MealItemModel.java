package fitt_nutri.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "meal_item")
@Data
public class MealItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String alimento;
    private Double quantidade;
    private String unidade;

    @ManyToOne
    @JoinColumn(name = "meal_id")
    @JsonBackReference
    private MealModel meal;
}
