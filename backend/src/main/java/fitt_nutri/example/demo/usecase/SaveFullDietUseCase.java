package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.adapter.MealGateway;
import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.domain.entity.MealItem;
import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor

public class SaveFullDietUseCase {

    private final MealGateway mealGateway;

    public void execute(Integer patientId, FullDietRequestDTO dto) {

        for (MealRequestDTO mealDTO : dto.getRefeicoes()) {

            Meal meal = toDomain(mealDTO);

            mealGateway.save(patientId, meal);
        }
    }

    private Meal toDomain(MealRequestDTO dto) {
        Meal m = new Meal();
        m.setDescricao(dto.getDescricao());
        m.setHorario(dto.getHorario());
        m.setObservacao(dto.getObservacao());

        List<MealItem> items = dto.getAlimentos().stream().map(i -> {
            MealItem item = new MealItem();
            item.setAlimento(i.getAlimento());
            item.setQuantidade(i.getQuantidade());
            item.setUnidade(i.getUnidade());
            return item;
        }).toList();

        m.setAlimentos(items);

        return m;
    }
}
