package fitt_nutri.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.br.CPF;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
@Entity
@Table(
        name = "nutricionists",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_nutricionista_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_nutricionista_cpf", columnNames = "cpf")
        }
)
public class UserNutritionistModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Nome não pode estar vazio")
    @Column(nullable = false)
    private String nome;

    @NotBlank @Email
    @Column(nullable = false, unique = true)
    private String email;

    @CPF @NotBlank
    @Column(nullable = false, unique = true)
    private String cpf;

    @NotBlank
    @Pattern(regexp = "^\\d{1,6}/[A-Z]{2}$", message = "CRN deve estar no formato 12345/UF")
    @Column(nullable = false)
    private String crn;

    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    @Column(nullable = false)
    @JsonIgnore // não retornar senha na API
    private String senha;

    @OneToMany(mappedBy = "nutricionista", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<UserPatientModel> pacientes = new ArrayList<>();

    // Helpers p/ manter a relação bi-direcional consistente
    public void addPaciente(UserPatientModel p) {
        pacientes.add(p);
        p.setNutricionista(this);
    }
    public void removePaciente(UserPatientModel p) {
        pacientes.remove(p);
        p.setNutricionista(null);
    }

    // equals/hashCode por ID para JPA
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserNutritionistModel that)) return false;
        return id != null && Objects.equals(id, that.id);
    }
    @Override public int hashCode() { return 31; }
}
