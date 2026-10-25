package fitt_nutri.example.demo.usecase;

import fitt_nutri.example.demo.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Gera o PDF do plano alimentar de um paciente.
 *
 * O desenho do PDF fica em {@link fitt_nutri.example.demo.service.DietPdfService}. Passar pelo
 * MealService mantém uma única regra (inclusive a checagem de que o paciente pertence ao
 * nutricionista logado) para o botão de imprimir e para o envio à nuvem.
 */
@Component
@RequiredArgsConstructor
public class GenerateDietPdfUseCase {

    private final MealService mealService;

    public byte[] execute(Integer patientId) throws Exception {
        return mealService.generateDietPdf(patientId);
    }
}
