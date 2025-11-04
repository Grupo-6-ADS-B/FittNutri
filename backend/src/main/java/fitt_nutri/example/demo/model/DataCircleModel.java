package fitt_nutri.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(
        name = "dados_circunferencia",
        uniqueConstraints = {
                // 🔐 Garante que o rótulo seja único por paciente (opcional, mas recomendado)
                @UniqueConstraint(name = "uk_rotulo_paciente", columnNames = {"rotulo", "idUsuarioFK"})
        }
)
public class DataCircleModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idDadosCircunferencia;

    @NotBlank(message = "O rótulo da medição não pode estar vazio")
    @Column(nullable = false, length = 100)
    private String rotulo;

    @NotNull(message = "Abdominal não pode estar vazio")
    @Column(nullable = false)
    private Double abdominal;

    @NotNull(message = "Cintura não pode estar vazio")
    @Column(nullable = false)
    private Double cintura;

    @NotNull(message = "Quadril não pode estar vazio")
    @Column(nullable = false)
    private Double quadril;

    @NotNull(message = "Punho não pode estar vazio")
    @Column(nullable = false)
    private Double pulso;

    @NotNull(message = "Panturrilha não pode estar vazio")
    @Column(nullable = false)
    private Double panturrilha;

    @NotNull(message = "Braço não pode estar vazio")
    @Column(nullable = false)
    private Double braco;

    @NotNull(message = "Coxa não pode estar vazio")
    @Column(nullable = false)
    private Double coxa;

    @NotNull(message = "Peso ideal não pode estar vazio")
    @Column(nullable = false)
    @Max(value = 150, message = "O peso ideal não pode ultrapassar 150 kg")
    private Double pesoIdeal;

    // 🔗 Relacionamento N:1 com o paciente (lado dono da FK)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuarioFK", nullable = false)
    @JsonBackReference
    private PatientModel paciente;
}