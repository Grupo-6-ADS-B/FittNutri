package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.MealModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealRepository extends JpaRepository<MealModel, Integer> {
    List<MealModel> findByPatientId(Integer patientId);
}
