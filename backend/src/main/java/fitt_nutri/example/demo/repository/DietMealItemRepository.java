package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DietMealItemModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DietMealItemRepository extends JpaRepository<DietMealItemModel, Integer> {

    List<DietMealItemModel> findByRefeicaoId(Integer refeicaoId);
}