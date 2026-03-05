package fitt_nutri.example.demo.application.usecase;

import fitt_nutri.example.demo.domain.port.in.CreateFullDietUseCase;
import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.domain.port.out.PatientRepositoryPort;
import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.request.MealItemDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreateFullDietService implements CreateFullDietUseCase {

    private final PatientRepositoryPort patientPort;
    private final MealRepositoryPort mealPort;

    @Override
    @Transactional
    public List<MealModel> execute(Integer patientId, FullDietRequestDTO request) {
        PatientModel patient = patientPort.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        List<MealModel> old = mealPort.findByPatient(patient);
        if (!old.isEmpty()) {
            mealPort.deleteAll(old);
        }

        List<MealModel> newMeals = request.getRefeicoes().stream().map(dto -> toMealModel(dto, patient))
                .map(mealPort::save)
                .collect(Collectors.toList());

        return newMeals;
    }

    private MealModel toMealModel(MealRequestDTO dto, PatientModel patient) {
        MealModel meal = new MealModel();
        meal.setDescricao(dto.getDescricao());
        meal.setHorario(dto.getHorario());
        meal.setObservacao(dto.getObservacao());
        meal.setPatient(patient);

        List<MealItemModel> itens = dto.getAlimentos().stream().map(this::toMealItemModel)
                .peek(i -> i.setMeal(meal))
                .collect(Collectors.toList());

        meal.setAlimentos(itens);
        return meal;
    }

    private MealItemModel toMealItemModel(MealItemDTO it) {
        MealItemModel item = new MealItemModel();
        item.setAlimento(it.getAlimento());
        item.setQuantidade(it.getQuantidade());
        item.setUnidade(it.getUnidade());
        return item;
    }
}