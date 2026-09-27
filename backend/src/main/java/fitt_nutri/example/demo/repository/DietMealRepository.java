package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DietMealModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DietMealRepository extends JpaRepository<DietMealModel, Integer> {

    List<DietMealModel> findByDietaIdOrderByHorario(Integer dietaId);
}