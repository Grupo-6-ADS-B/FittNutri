package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.dto.response.MealItemResponseDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.dto.response.PatientMealsResponseDTO;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class GetMealsByPatientUseCase {

    private final MealRepository mealRepository;

    public PatientMealsResponseDTO execute(Integer patientId) {

        List<MealModel> meals = mealRepository.findByPatientId(patientId);

        List<MealResponseDTO> refeicoes = meals.stream().map(meal -> {

            MealResponseDTO dto = new MealResponseDTO();
            dto.setId(meal.getId());
            dto.setHorario(meal.getHorario());
            dto.setDescricao(meal.getDescricao());
            dto.setObservacao(meal.getObservacao());

            List<MealItemResponseDTO> itens = meal.getAlimentos().stream().map(item -> {
                MealItemResponseDTO i = new MealItemResponseDTO();
                i.setId(item.getId());
                i.setAlimento(item.getAlimento());
                i.setQuantidade(item.getQuantidade());
                i.setUnidade(item.getUnidade());
                return i;
            }).toList();

            dto.setAlimentos(itens);
            return dto;

        }).toList();

        PatientMealsResponseDTO response = new PatientMealsResponseDTO();
        response.setId(patientId);
        response.setRefeicoes(refeicoes);

        return response;
    }
}
