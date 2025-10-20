package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserModel, Integer> {

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByCrn(String crn);

    Optional<UserModel> findByEmail(String email);

    Optional<UserModel> findByCpf(String cpf);

    Optional<UserModel> findByCrn(String crn);

}
