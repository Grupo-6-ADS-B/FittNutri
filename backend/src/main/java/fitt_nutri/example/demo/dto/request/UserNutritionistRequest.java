package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserNutritionistRequest {

    @NotBlank(message = "Nome não pode estar vazio")
    private String nome;

    @NotBlank(message = "Email não pode estar vazio")
    @Email(message = "Email inválido")
    private String email;

    @CPF
    @NotBlank(message = "CPF não pode estar vazio")
    private String cpf;

    @NotBlank(message = "CRN não pode estar vazio")
    @Pattern(regexp = "^\\d{1,6}/[A-Z]{2}$", message = "CRN deve estar no formato 12345/UF")
    private String crn;

    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    private String senha;
}
