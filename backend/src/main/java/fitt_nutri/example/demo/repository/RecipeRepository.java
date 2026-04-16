package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.RecipeModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<RecipeModel, Integer> {

    Page<RecipeModel> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}