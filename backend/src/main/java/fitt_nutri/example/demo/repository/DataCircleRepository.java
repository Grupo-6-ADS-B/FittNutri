package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DataCircleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataCircleRepository extends JpaRepository<DataCircleModel, Integer> {

    boolean existsByPaciente_Id(Integer pacienteId);

    // listar registros de um paciente
    List<DataCircleModel> findByPaciente_Id(Integer pacienteId);
}
