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
@Table(name = "users")
public class UserNutritionistModel {

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
    @Pattern(regexp = "^\\d{1,6}/[A-Z]{2}$", message = "CRN deve estar no formato 12345/UF")
    @Column(nullable = false)
    private String crn;

    @Column(nullable = false)
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    private String senha;
}







