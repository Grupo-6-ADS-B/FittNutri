package fitt_nutri.example.demo.application.usecase;

import fitt_nutri.example.demo.domain.port.in.DeleteMealUseCase;
import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeleteMealService implements DeleteMealUseCase {

    private final MealRepositoryPort mealPort;

    @Override
    @Transactional
    public void execute(Integer mealId) {
        var meal = mealPort.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));
        mealPort.delete(meal);
    }
}