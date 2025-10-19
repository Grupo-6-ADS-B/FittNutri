package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.AnthropometricDataModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnthropometricDataRepository extends JpaRepository<AnthropometricDataModel, Integer> {
//    List<AnthropometricDataModel> findByPaciente_Id(Integer pacienteId);
//    AnthropometricDataModel findFirstByPaciente_Id(Integer pacienteId);
}