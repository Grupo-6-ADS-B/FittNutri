package fitt_nutri.example.demo.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class FullDietRequestDTO {
    private Integer id; // id do paciente
    private List<MealRequestItemDTO> refeicoes;
}

