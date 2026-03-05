package fitt_nutri.example.demo.application.usecase;

import fitt_nutri.example.demo.domain.port.in.AddMealUseCase;
import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.domain.port.out.PatientRepositoryPort;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddMealService implements AddMealUseCase {

    private final PatientRepositoryPort patientPort;
    private final MealRepositoryPort mealPort;

    @Override
    public MealModel execute(Integer patientId, MealRequestDTO dto) {
        PatientModel patient = patientPort.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        MealModel meal = new MealModel();
        meal.setDescricao(dto.getDescricao());
        meal.setHorario(dto.getHorario());
        meal.setObservacao(dto.getObservacao());
        meal.setPatient(patient);

        List<MealItemModel> itens = dto.getAlimentos().stream().map(itemDto -> {
            MealItemModel item = new MealItemModel();
            item.setAlimento(itemDto.getAlimento());
            item.setQuantidade(itemDto.getQuantidade());
            item.setUnidade(itemDto.getUnidade());
            item.setMeal(meal);
            return item;
        }).collect(Collectors.toList());

        meal.setAlimentos(itens);

        return mealPort.save(meal);
    }
}