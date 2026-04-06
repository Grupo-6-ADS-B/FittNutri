package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.NotNull;

public record RecipeIngredientRequestDTO(

        Integer alimentoId,
        Integer alimentoCustomId,

        @NotNull(message = "Quantidade não pode estar vazia")
        Double quantidadeG,

        String unidade
) {}