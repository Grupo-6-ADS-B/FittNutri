package fitt_nutri.example.demo.domain.port.out;

import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;

import java.util.List;
import java.util.Optional;

public interface MealRepositoryPort {
    List<MealModel> findByPatient(PatientModel patient);
    List<MealModel> findByPatientId(Integer patientId);
    void deleteAll(List<MealModel> meals);
    MealModel save(MealModel meal);
    Optional<MealModel> findById(Integer id);
    void delete(MealModel meal);
}