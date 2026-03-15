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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id")
    private FoodItensModel foodItem;

    @Column(name = "snapshot_kcal")
    private Double snapshotKcal;

    @Column(name = "snapshot_proteina")
    private Double snapshotProteina;

    @Column(name = "snapshot_carboidrato")
    private Double snapshotCarboidrato;

    @Column(name = "snapshot_lipideos")
    private Double snapshotLipideos;

    @Column(name = "snapshot_fibra")
    private Double snapshotFibra;

    @ManyToOne
    @JoinColumn(name = "meal_id")
    @JsonBackReference
    private MealModel meal;
}
