package fitt_nutri.example.demo.dto.request;

import fitt_nutri.example.demo.model.CustomFoodModel.TipoMacro;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CustomFoodRequestDTO(

        @NotBlank(message = "Nome não pode estar vazio")
        String nome,

        @NotNull(message = "Tipo de macro não pode estar vazio")
        TipoMacro tipoMacro,

        Double porcaoG,
        Double energiaKcal,
        Double proteina,
        Double lipideos,
        Double carboidrato,
        Double fibra,
        Double sodio
) {}