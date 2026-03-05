package fitt_nutri.example.demo.domain.port.in;

import fitt_nutri.example.demo.model.MealModel;

import java.util.List;

public interface GetMealsByPatientUseCase {
    List<MealModel> execute(Integer patientId);
}