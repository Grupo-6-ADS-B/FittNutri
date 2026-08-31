package fitt_nutri.example.demo.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Macros {
    private double proteina;
    private double carboidrato;
    private double lipideos;
    private double fibra;
    private double kcal;

    public Macros add(Macros other) {
        return new Macros(
                this.proteina + other.proteina,
                this.carboidrato + other.carboidrato,
                this.lipideos + other.lipideos,
                this.fibra + other.fibra,
                this.kcal + other.kcal
        );
    }
}
