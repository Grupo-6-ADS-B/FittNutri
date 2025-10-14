package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DadosAntropometricosModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DadosAntropometricosRepository extends JpaRepository<DadosAntropometricosModel, Integer> {
}