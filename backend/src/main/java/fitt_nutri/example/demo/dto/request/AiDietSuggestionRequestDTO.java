package fitt_nutri.example.demo.dto.request;

import lombok.Data;

@Data
public class AiDietSuggestionRequestDTO {

    private String objetivo;

    private String restricoes;

    private String preferencias;

    private Integer numeroRefeicoes;

    private Integer calorias;

    private String observacoes;
}