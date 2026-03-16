package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.domain.entity.Meal;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateMealUseCase {
    private final MealRepository mealRepository;
    private final PatientRepository patientRepository;

    public Meal execute(Integer patientId, Meal dto) {
        if (patientRepository.findIdById(patientId).isEmpty()) {
            throw new NotFoundException("Paciente não encontrado");
        }
        dto.setPatientId(patientId);
        return mealRepository.save(dto);
    }
}