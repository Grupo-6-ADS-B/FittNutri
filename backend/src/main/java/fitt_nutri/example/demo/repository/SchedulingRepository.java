package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.SchedulingModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchedulingRepository extends JpaRepository<SchedulingModel, Integer> {
    List<SchedulingModel> findByPacienteId(Integer pacienteId);
    List<SchedulingModel> findByNutricionistaId(Integer usuarioId);
}
