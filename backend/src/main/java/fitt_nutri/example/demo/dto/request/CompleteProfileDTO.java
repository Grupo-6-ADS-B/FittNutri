package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record CompleteProfileDTO(
        @NotBlank(message = "CPF não pode estar vazio")
        @CPF(message = "CPF inválido")
        String cpf,

        @NotBlank(message = "CRN não pode estar vazio")
        @Size(max = 20, message = "CRN deve ter no máximo 20 caracteres")
        String crn
) {}
