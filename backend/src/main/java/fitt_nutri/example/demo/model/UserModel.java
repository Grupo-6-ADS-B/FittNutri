package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Usuário")
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Nome não pode estar vazio")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Email não pode estar vazio")
    @Email(message = "Email inválido")
    @Column(nullable = false, unique = true)
    private String email;

    @CPF
    @NotBlank(message = "CPF não pode estar vazio")
    @Column(nullable = false, unique = true)
    private String cpf;

    @NotBlank(message = "CRN não pode estar vazio")
    @Column(nullable = false)
    private String crn;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "A senha deve ter no mínimo 8 caracteres e incluir letras maiúsculas, minúsculas, números e caracteres especiais"
    )
    @Column(nullable = false)
    private String senha;

}







