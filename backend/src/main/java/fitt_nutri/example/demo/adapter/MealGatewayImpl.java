package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.domain.entity.MealItem;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class MealGatewayImpl implements MealGateway {

    private final MealRepository repository;
    private final PatientRepository patientRepository;
    private final FoodItensRepository foodItensRepository;

    @Override
    public Meal save(Integer patientId, Meal meal) {

        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        MealModel model = toModel(meal);
        model.setPatient(patient);

        if (meal.getAlimentos() != null) {
            List<MealItemModel> itens = meal.getAlimentos().stream()
                    .map(item -> buildMealItem(item, model))
                    .collect(Collectors.toList());
            model.setAlimentos(itens);
        }

        MealModel saved = repository.save(model);

        return toDomain(saved);
    }

    @Override
    public Meal update(Integer mealId, Meal meal) {

        MealModel existing = repository.findById(mealId)
                .orElseThrow(() -> new RuntimeException("Refeição não encontrada"));

        existing.setDescricao(meal.getDescricao());
        existing.setHorario(meal.getHorario());
        existing.setObservacao(meal.getObservacao());

        if (meal.getAlimentos() != null) {
            existing.getAlimentos().clear();
            List<MealItemModel> itens = meal.getAlimentos().stream()
                    .map(item -> buildMealItem(item, existing))
                    .collect(Collectors.toList());
            existing.setAlimentos(itens);
        }

        MealModel saved = repository.save(existing);

        return toDomain(saved);
    }

    @Override
    public void delete(Integer mealId) {
        repository.deleteById(mealId);
    }

    @Override
    public List<Meal> findByPatient(Integer patientId) {
        return repository.findByPatientId(patientId)
                .stream()
                .map(this::toDomain)
                .toList();
    }

    private MealItemModel buildMealItem(MealItem item, MealModel meal) {
        MealItemModel model = new MealItemModel();
        model.setAlimento(item.getAlimento());
        model.setQuantidade(item.getQuantidade());
        model.setUnidade(item.getUnidade());
        model.setMeal(meal);

        if (item.getFoodItemId() != null) {
            foodItensRepository.findById(item.getFoodItemId()).ifPresentOrElse(
                    food -> {
                        model.setFoodItem(food);
                        capturarSnapshots(model, food, item.getQuantidade());
                        if (model.getAlimento() == null || model.getAlimento().isBlank()) {
                            model.setAlimento(food.getNome());
                        }
                    },
                    () -> log.warn("foodItemId={} não encontrado; item salvo sem snapshot", item.getFoodItemId())
            );
        }

        return model;
    }

    private void capturarSnapshots(MealItemModel item, FoodItensModel food, Double quantidade) {
        if (quantidade == null || quantidade <= 0) return;
        item.setSnapshotKcal(round(safe(food.getEnergiaKcal()) * quantidade));
        item.setSnapshotProteina(round(safe(food.getProteina()) * quantidade));
        item.setSnapshotCarboidrato(round(safe(food.getCarboidrato()) * quantidade));
        item.setSnapshotLipideos(round(safe(food.getLipideos()) * quantidade));
        item.setSnapshotFibra(round(safe(food.getFibra()) * quantidade));
    }

    private double round(double d) {
        return Math.round(d * 10.0) / 10.0;
    }

    private double safe(Double value) {
        return value != null ? value : 0.0;
    }

    private MealModel toModel(Meal meal) {
        MealModel m = new MealModel();
        m.setDescricao(meal.getDescricao());
        m.setHorario(meal.getHorario());
        m.setObservacao(meal.getObservacao());
        return m;
    }

    private Meal toDomain(MealModel model) {
        Meal m = new Meal();
        m.setDescricao(model.getDescricao());
        m.setHorario(model.getHorario());
        m.setObservacao(model.getObservacao());
        return m;
    }
}