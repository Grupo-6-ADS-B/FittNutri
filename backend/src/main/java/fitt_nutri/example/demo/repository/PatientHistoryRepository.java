package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.PatientHistoryModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PatientHistoryRepository extends JpaRepository<PatientHistoryModel, Long> {

    List<PatientHistoryModel> findByPatientModelIdOrderByDataConsultaAsc(Integer pacienteId);

    @Query("""
    SELECT h FROM PatientHistoryModel h
    WHERE h.patientModel.id = :pacienteId
    AND h.dataConsulta BETWEEN :inicio AND :fim
    ORDER BY h.dataConsulta
""")
    List<PatientHistoryModel> buscarPorPacienteEPeriodo(
            @Param("pacienteId") Integer pacienteId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    @Query("""
    SELECT h FROM PatientHistoryModel h
    WHERE h.patientModel.id = :pacienteId
    AND h.dataConsulta BETWEEN :inicio AND :fim
    ORDER BY h.dataConsulta
    """)
    Page<PatientHistoryModel> buscarPorPacienteEPeriodo(
            @Param("pacienteId") Integer pacienteId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            Pageable pageable
    );


}
