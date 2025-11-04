package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.PatientModel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<PatientModel, Integer> {
    boolean existsByEmail(@Email @NotBlank(message = "Email não pode estar vazio") String email);

    boolean existsByCpf(@CPF @NotBlank(message = "CPF não pode estar vazio") String cpf);

    boolean existsByNome(@NotBlank(message = "Nome não pode estar vazio") String nome);
}
