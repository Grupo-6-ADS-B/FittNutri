package fitt_nutri.example.demo.domain.port.out;

import fitt_nutri.example.demo.model.PatientModel;

import java.util.Optional;

public interface PatientRepositoryPort {
    Optional<PatientModel> findById(Integer id);
}