package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MealGatewayImpl implements MealGateway {

    private final MealRepository repository;
    private final PatientRepository patientRepository;

    @Override
    public Meal save(Integer patientId, Meal meal) {

        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        MealModel model = toModel(meal);
        model.setPatient(patient);

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

    // converters
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