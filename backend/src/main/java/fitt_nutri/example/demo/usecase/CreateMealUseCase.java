package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.adapter.MealGateway;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@RequiredArgsConstructor
public class CreateMealUseCase {

    private final MealGateway mealGateway;

    public void execute(Integer patientId, Meal meal) {
        mealGateway.save(patientId, meal);
    }
}