package fitt_nutri.example.demo.infra.adapter;

import fitt_nutri.example.demo.domain.port.out.PatientRepositoryPort;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PatientRepositoryAdapter implements PatientRepositoryPort {

    private final PatientRepository patientRepository;

    @Override
    public Optional<PatientModel> findById(Integer id) {
        return patientRepository.findById(id);
    }
}