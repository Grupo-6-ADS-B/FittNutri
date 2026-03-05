package fitt_nutri.example.demo.application.usecase;

import fitt_nutri.example.demo.domain.port.in.UpdateMealUseCase;
import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateMealService implements UpdateMealUseCase {

    private final MealRepositoryPort mealPort;

    @Override
    @Transactional
    public MealModel execute(Integer mealId, MealModel updatedMeal) {
        MealModel existingMeal = mealPort.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));

        existingMeal.setDescricao(updatedMeal.getDescricao());
        existingMeal.setHorario(updatedMeal.getHorario());
        existingMeal.setObservacao(updatedMeal.getObservacao());

        existingMeal.getAlimentos().clear();
        if (updatedMeal.getAlimentos() != null) {
            updatedMeal.getAlimentos().forEach(item -> {
                item.setMeal(existingMeal);
                existingMeal.getAlimentos().add(item);
            });
        }

        return mealPort.save(existingMeal);
    }
}