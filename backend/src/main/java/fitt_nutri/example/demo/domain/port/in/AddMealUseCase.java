package fitt_nutri.example.demo.domain.port.in;

import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.model.MealModel;

public interface AddMealUseCase {
    MealModel execute(Integer patientId, MealRequestDTO request);

}
