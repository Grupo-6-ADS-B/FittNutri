package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DataCircleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DataCircleRepository extends JpaRepository<DataCircleModel, Integer> {

    // Verifica se já existe um registro com o mesmo rótulo
    boolean existsByRotulo(String rotulo);

    // Retorna todas as circunferências de um paciente específico
    List<DataCircleModel> findByPaciente_Id(Integer pacienteId);

    boolean existsByRotuloAndPaciente_Id(String novoRotulo, Integer pacienteId);
}
