package fitt_nutri.example.demo.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class DietRequestDTO {
    private String nome;
    private String observacao;
    private List<DietMealRequestDTO> refeicoes;
}
