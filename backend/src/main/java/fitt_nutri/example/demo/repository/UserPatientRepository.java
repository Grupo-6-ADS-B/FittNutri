package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.UserPatientModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPatientRepository extends JpaRepository<UserPatientModel, Integer> {
    List<UserPatientModel> findByNomeContainingIgnoreCase(String nome);
}
