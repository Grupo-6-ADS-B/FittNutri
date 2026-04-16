package fitt_nutri.example.demo.dto.response;

import fitt_nutri.example.demo.model.CustomFoodModel.TipoMacro;

public record CustomFoodResponseDTO(
        Integer id,
        String nome,
        TipoMacro tipoMacro,
        Double porcaoG,
        Double energiaKcal,
        Double proteina,
        Double lipideos,
        Double carboidrato,
        Double fibra,
        Double sodio
) {}