package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "receita_alimentos")
public class CustomFoodModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_macro", nullable = false)
    private TipoMacro tipoMacro;

    @Column(name = "porcao_g")
    private Double porcaoG;

    private Double energiaKcal;
    private Double proteina;
    private Double lipideos;
    private Double carboidrato;
    private Double fibra;
    private Double sodio;

    public enum TipoMacro {
        por_100g, total
    }
}
