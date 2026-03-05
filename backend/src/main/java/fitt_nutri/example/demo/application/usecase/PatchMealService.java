package fitt_nutri.example.demo.application.usecase;

import fitt_nutri.example.demo.domain.port.in.PatchMealUseCase;
import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatchMealService implements PatchMealUseCase {

    private final MealRepositoryPort mealPort;

    @Override
    @Transactional
    public MealModel execute(Integer mealId, MealModel mealPatch) {
        MealModel existingMeal = mealPort.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));

        if (mealPatch.getHorario() != null) existingMeal.setHorario(mealPatch.getHorario());
        if (mealPatch.getDescricao() != null) existingMeal.setDescricao(mealPatch.getDescricao());
        if (mealPatch.getObservacao() != null) existingMeal.setObservacao(mealPatch.getObservacao());

        return mealPort.save(existingMeal);
    }
}