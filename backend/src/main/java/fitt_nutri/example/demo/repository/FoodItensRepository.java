package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.FoodItensModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface FoodItensRepository extends JpaRepository<FoodItensModel, Integer> {

    Optional<FoodItensModel> findByNome(String nome);

}
