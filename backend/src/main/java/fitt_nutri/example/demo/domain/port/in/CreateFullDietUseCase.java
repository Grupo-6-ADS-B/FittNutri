package fitt_nutri.example.demo.domain.port.in;

import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.model.MealModel;

import java.util.List;

public interface CreateFullDietUseCase {
    List<MealModel> execute(Integer patientId, FullDietRequestDTO request);
}