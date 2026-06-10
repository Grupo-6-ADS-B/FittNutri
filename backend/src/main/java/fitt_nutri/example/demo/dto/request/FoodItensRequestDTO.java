package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record FoodItensRequestDTO(

        @NotBlank(message = "Nome do alimento não pode estar vazio")
        @Size(max = 200, message = "Nome do alimento deve ter no máximo 200 caracteres")
        String nome,

        @NotNull(message = "Energia (kcal) não pode ser nula")
        @Positive(message = "Energia (kcal) deve ser positiva")
        Double energiaKcal,

        Double proteina,
        Double carboidrato,
        Double lipideos,
        Double fibra,
        Double umidade,
        Double colesterol,
        Double cinzas,
        Double calcio,
        Double magnesio,
        Double manganes,
        Double fosforo,
        Double ferro,
        Double sodio,
        Double potassio,
        Double cobre,
        Double zinco,
        Double retinol,
        Double tiamina,
        Double riboflavina,
        Double piridoxina,
        Double niacina,
        Double vitaminaC
) {}
