package fitt_nutri.example.demo.dto.response;

import lombok.Data;

@Data
public class MealItemResponseDTO {
    private Integer id;
    private String alimento;
    private Double quantidade;
    private String unidade;
    private Double snapshotKcal;
    private Double snapshotProteina;
    private Double snapshotCarboidrato;
    private Double snapshotLipideos;
    private Double snapshotFibra;
}
