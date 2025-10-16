package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.*;

public record UserRequestDTO(
        @NotBlank(message = "Nome não pode estar vazio") String nome,
        @NotBlank(message = "Email não pode estar vazio") @Email(message = "Email inválido") String email,
        @NotBlank(message = "CPF não pode estar vazio") String cpf,
        @NotBlank(message = "CRN não pode estar vazio") String crn,
        @NotBlank(message = "Senha não pode estar vazia")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "A senha deve ter no mínimo 8 caracteres e incluir letras maiúsculas, minúsculas, números e caracteres especiais"
        ) String senha
) {}
