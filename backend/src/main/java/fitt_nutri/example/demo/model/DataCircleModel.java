package fitt_nutri.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "dados_circunferencia")
public class DataCircleModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idDadosCircunferencia;


    private Double abdominal;


    private Double cintura;

    private Double quadril;


    private Double pulso;


    private Double panturrilha;


    private Double braco;


    private Double coxa;


    @Max(value = 150, message = "O peso ideal não pode ultrapassar 150 kg")
    private Double pesoIdeal;

    // 🔗 Relacionamento N:1 com o paciente (lado dono da FK)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuarioFK", nullable = false)
    @JsonBackReference
    private PatientModel paciente;
}
