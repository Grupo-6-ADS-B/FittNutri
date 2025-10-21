package fitt_nutri.example.demo.dto.login;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginListDTO {

    @Schema(description = "ID do usuário", example = "1")
    private Integer id;

    @Schema(description = "Nome do usuário", example = "John doe")
    private String nome;

    @Schema(description = "Email do usuário", example = "John doe")
    @Email(message = "Email inválido")
    private String email;


}
