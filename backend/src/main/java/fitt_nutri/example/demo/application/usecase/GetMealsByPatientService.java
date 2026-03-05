package fitt_nutri.example.demo.application.usecase;

import fitt_nutri.example.demo.domain.port.in.GetMealsByPatientUseCase;
import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.domain.port.out.PatientRepositoryPort;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetMealsByPatientService implements GetMealsByPatientUseCase {

    private final PatientRepositoryPort patientPort;
    private final MealRepositoryPort mealPort;

    @Override
    public List<MealModel> execute(Integer patientId) {
        PatientModel patient = patientPort.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        return mealPort.findByPatient(patient);
    }
}
