package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.CustomFoodModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomFoodRepository extends JpaRepository<CustomFoodModel, Integer> {

    Page<CustomFoodModel> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}