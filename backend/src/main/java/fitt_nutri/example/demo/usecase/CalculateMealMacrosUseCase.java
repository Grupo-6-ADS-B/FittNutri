package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.domain.entity.Macros;
import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.domain.entity.MealItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CalculateMealMacrosUseCase {

    private final FoodItensRepository foodRepo;

    public Macros execute(Meal meal) {
        Macros total = new Macros(0,0,0,0,0);
        for (MealItem item : meal.getAlimentos()) {
            if (item.getQuantidade() == null || item.getQuantidade() <= 0) continue;
            var matches = foodRepo.findByNomeContainingIgnoreCase(item.getAlimento());
            if (matches.isEmpty()) continue;
            var food = matches.get(0);
            double q = item.getQuantidade();
            Macros m = new Macros(
                    safe(food.getProteina()) * q,
                    safe(food.getCarboidrato()) * q,
                    safe(food.getLipideos()) * q,
                    safe(food.getFibra()) * q,
                    safe(food.getEnergiaKcal()) * q
            );
            total = total.add(m);
        }
        return total;
    }

    private double safe(Double v) { return v == null ? 0.0 : v; }
}