package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.UserNutritionistModel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface UserNutritionistRepository extends JpaRepository<UserNutritionistModel, Integer> {


    boolean existsByEmail(@NotBlank(message = "Email não pode estar vazio") @Email(message = "Email inválido") String email);

    boolean existsByCpf(String cpf);

    boolean existsByCrn(String crn);


    Optional<UserNutritionistModel> findByEmail(String email);
}
