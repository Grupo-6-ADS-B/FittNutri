package fitt_nutri.example.demo.domain.port.out;

import fitt_nutri.example.demo.model.FoodItensModel;

import java.util.List;
import java.util.Optional;

public interface FoodItensRepositoryPort {
    Optional<FoodItensModel> findByNome(String nome);
    List<FoodItensModel> findByNomeContainingIgnoreCase(String nomeParte);
    Optional<FoodItensModel> findById(Integer id);
    List<FoodItensModel> findAll();
}