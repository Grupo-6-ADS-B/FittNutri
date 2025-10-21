package fitt_nutri.example.demo.dto.login;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginTokenDTO {
    private Long id;
    private String nome;
    private String email;
    private String token;
}
