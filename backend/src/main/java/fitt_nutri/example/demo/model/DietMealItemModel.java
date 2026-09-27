package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "dieta_refeicao_itens")
public class DietMealItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refeicao_id", nullable = false)
    private DietMealModel refeicao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alimento_id")
    private FoodItensModel alimento;

    private String descricao;

    @Column(precision = 10, scale = 2)
    private BigDecimal quantidade;

    private String unidade;

    @Column(columnDefinition = "TEXT")
    private String observacao;
}