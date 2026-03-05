package fitt_nutri.example.demo.infra.adapter;

import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MealRepositoryAdapter implements MealRepositoryPort {

    private final MealRepository mealRepository;

    @Override
    public List<MealModel> findByPatient(PatientModel patient) {
        return mealRepository.findByPatient(patient);
    }

    @Override
    public List<MealModel> findByPatientId(Integer patientId) {
        return mealRepository.findByPatientId(patientId);
    }

    @Override
    public void deleteAll(List<MealModel> meals) {
        mealRepository.deleteAll(meals);
    }

    @Override
    public MealModel save(MealModel meal) {
        return mealRepository.save(meal);
    }

    @Override
    public Optional<MealModel> findById(Integer id) {
        return mealRepository.findById(id);
    }

    @Override
    public void delete(MealModel meal) {
        mealRepository.delete(meal);
    }
}