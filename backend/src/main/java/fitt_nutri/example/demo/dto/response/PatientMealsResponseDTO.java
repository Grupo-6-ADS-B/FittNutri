package fitt_nutri.example.demo.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class PatientMealsResponseDTO {
    private Integer id;
    private List<MealResponseDTO> refeicoes;
}
