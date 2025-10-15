package fitt_nutri.example.demo.dto.login;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class LoginCreateDTO {

    @Schema(description = "Nome do usuário", example = "John doe")
    private String nome;

    @Email(message = "Email inválido")
    @Schema(description = "Email do usuário", example = "johndoe@email.com")
    private String email;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "A senha deve ter no mínimo 8 caracteres e incluir letras maiúsculas, minúsculas, números e caracteres especiais"
    )
    @Schema(description = "Senha do usuário", example = "Senha123!")
    private String senha;
}
