package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealRepository extends JpaRepository<MealModel, Integer> {

    List<MealModel> findByPatientId(Integer patientId);

    List<MealModel> findByPatient(PatientModel patient);
}
