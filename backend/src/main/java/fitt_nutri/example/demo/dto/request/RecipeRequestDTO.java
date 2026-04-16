package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RecipeRequestDTO(

        @NotBlank(message = "Nome não pode estar vazio")
        String nome,

        String modoPreparo,
        Double porcaoG,
        Double rendimentoG,

        @NotEmpty(message = "A receita deve ter ao menos um ingrediente")
        List<RecipeIngredientRequestDTO> ingredientes
) {}