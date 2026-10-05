package fitt_nutri.example.demo.dto;

import java.util.List;

public record AnaliseNutricionalIA(
        String classificacaoPerfil,
        String nivelAtencao,
        String resumo,
        List<String> insights,
        List<String> sugestoes,
        List<String> alertas
) {
}
