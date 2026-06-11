package fitt_nutri.example.demo.dto.request;
import org.hibernate.validator.constraints.br.CPF;

import jakarta.validation.constraints.*;

public record UserRequestDTO(
        @NotBlank(message = "Nome não pode estar vazio")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @NotBlank(message = "Email não pode estar vazio")
        @Email(message = "Email inválido")
        @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
        String email,

        @NotBlank(message = "CPF não pode estar vazio")
        @CPF(message = "CPF inválido")
        @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres")
        String cpf,

        @NotBlank(message = "CRN não pode estar vazio")
        @Size(max = 20, message = "CRN deve ter no máximo 20 caracteres")
        String crn,

        @NotBlank(message = "Senha não pode estar vazia")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "A senha deve ter no mínimo 8 caracteres e incluir letras maiúsculas, minúsculas, números e caracteres especiais"
        ) String senha
) {}
