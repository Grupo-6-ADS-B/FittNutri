package fitt_nutri.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "patients")
public class UserPatientModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;

    @NotBlank(message = "O nome não pode estar vazio")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;

    // 🔗 Relação N:1 com o nutricionista
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "nutricionista_id", nullable = false)
    @JsonBackReference
    private UserNutritionistModel nutricionista;

    // 🔗 Relação 1:N com dados de circunferência
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DataCircleModel> circunferencias = new ArrayList<>();

    // Métodos auxiliares para manter a consistência bidirecional
    public void addCirc(DataCircleModel m) {
        if (m == null) return;
        if (!circunferencias.contains(m)) {
            circunferencias.add(m);
            m.setPaciente(this);
        }
    }

    public void removeCirc(DataCircleModel m) {
        if (m == null) return;
        if (circunferencias.remove(m)) {
            m.setPaciente(null);
        }
    }
}
