package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.domain.entity.Meal;

import java.util.List;

public interface MealGateway {

    Meal save(Integer patientId, Meal meal);

    Meal update(Integer mealId, Meal meal);

    void delete(Integer mealId);

    List<Meal> findByPatient(Integer patientId);
}
