package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record DadosPacienteIA(
        @NotNull @Min(1)
        Integer idade,

        @NotNull @DecimalMin("0.1")
        Double pesoKg,

        @NotNull @DecimalMin("0.1")
        Double alturaM,

        @NotBlank
        String sexo,

        @NotBlank
        String objetivo,

        @NotNull @DecimalMin("0.0")
        Double imc,

        @NotNull @DecimalMin("0.0")
        Double tmb,

        @NotNull @DecimalMin("0.0")
        Double caloriasDiarias,

        List<String> restricoesAlimentares,

        String observacoes
) {
}
