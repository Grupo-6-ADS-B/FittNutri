package fitt_nutri.example.demo.domain.port.in;

import fitt_nutri.example.demo.model.MealModel;

public interface PatchMealUseCase {
    MealModel execute(Integer mealId, MealModel mealPatch);
}