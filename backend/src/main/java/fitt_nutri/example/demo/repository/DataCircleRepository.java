package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DataCircleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DataCircleRepository extends JpaRepository<DataCircleModel, Integer> {

    // rótulo único POR paciente (coerente com a uniqueConstraint rotulo+idUsuarioFK)
    boolean existsByRotuloAndPaciente_Id(String rotulo, Integer pacienteId);

    // listar registros de um paciente
    List<DataCircleModel> findByPaciente_Id(Integer pacienteId);


    // buscar um registro específico pelo paciente + rótulo
    Optional<DataCircleModel> findByPaciente_IdAndRotulo(Integer pacienteId, String rotulo);

    // buscar o último registro do paciente
    Optional<DataCircleModel> findTopByPaciente_IdOrderByIdDadosCircunferenciaDesc(Integer pacienteId);

}
