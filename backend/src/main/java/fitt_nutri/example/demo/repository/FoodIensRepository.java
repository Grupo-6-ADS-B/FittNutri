package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.FoodItensModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodIensRepository extends JpaRepository<FoodItensModel, Integer> {

}
