package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "receita_ingredientes")
public class RecipeIngredientModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receita_id", nullable = false)
    private RecipeModel receita;

    // Ingrediente da tabela IBGE/TACO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alimento_id")
    private FoodItensModel alimento;

    // Ingrediente customizado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receita_alimento_id")
    private CustomFoodModel alimentoCustom;

    @Column(name = "quantidade_g", nullable = false)
    private Double quantidadeG;

    private String unidade;
}