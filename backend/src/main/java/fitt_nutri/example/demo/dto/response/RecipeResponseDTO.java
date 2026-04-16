package fitt_nutri.example.demo.dto.response;

import java.util.List;

public record RecipeResponseDTO(
        Integer id,
        String nome,
        String modoPreparo,
        Double porcaoG,
        Double rendimentoG,
        List<IngredienteResponseDTO> ingredientes,
        MacrosTotaisDTO macrosTotais,
        MacrosPorcaoDTO macrosPorcao
) {
    public record IngredienteResponseDTO(
            Integer id,
            String nomeAlimento,
            String origem,
            Double quantidadeG,
            String unidade
    ) {}

    public record MacrosTotaisDTO(
            double kcal, double proteina, double carboidrato,
            double gordura, double fibra, double sodio
    ) {}

    public record MacrosPorcaoDTO(
            double kcal, double proteina, double carboidrato,
            double gordura, double fibra, double sodio
    ) {}
}