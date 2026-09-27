package fitt_nutri.example.demo.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DietResponseDTO {
    private Integer id;
    private String nome;
    private String observacao;
    private LocalDateTime criadoEm;
    private List<DietMealResponseDTO> refeicoes;
}