package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeleteMealUseCase {

    private final MealRepository mealRepository;

    public void execute(Integer mealId) {
        mealRepository.deleteById(mealId);
    }
}