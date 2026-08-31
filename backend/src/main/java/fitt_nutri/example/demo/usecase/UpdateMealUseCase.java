package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.adapter.MealGateway;
import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UpdateMealUseCase {

    private final MealGateway mealGateway;

    public void execute(Integer mealId, Meal meal) {
        mealGateway.update(mealId, meal);
    }
}

