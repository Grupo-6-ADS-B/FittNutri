package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.FoodItensModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface FoodItensRepository extends JpaRepository<FoodItensModel, Integer> {

    Optional<FoodItensModel> findByNome(String nome);

    List<FoodItensModel> findByNomeContainingIgnoreCase(String nomeParte);

    @Query("SELECT f FROM FoodItensModel f WHERE (f.fonte = 'TACO' OR f.nutricionista.id = :nutricionistaId) AND LOWER(f.nome) LIKE LOWER(CONCAT('%', :nomeParte, '%'))")
    List<FoodItensModel> searchByNameForNutricionista(@Param("nomeParte") String nomeParte, @Param("nutricionistaId") Integer nutricionistaId);

    List<FoodItensModel> findByNutricionistaIdAndFonte(Integer nutricionistaId, String fonte);
}
