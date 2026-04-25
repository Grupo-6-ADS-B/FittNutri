package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.RecipeIngredientModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredientModel, Integer> {

    List<RecipeIngredientModel> findByReceitaId(Integer receitaId);
}