package fitt_nutri.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "dados_antropometricos")
public class AnthropometricDataModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDadosAntropometricos;

    @NotNull(message = "Altura não pode estar vazia")
    @Column(nullable = false)
    private Double altura;

    @NotNull(message = "Peso não pode estar vazio")
    @Column(nullable = false)
    private Double peso;

    @NotNull(message = "IMC não pode estar vazio")
    @Column(nullable = false)
    private Double imc;

    @NotNull(message = "Percentual de gordura não pode estar vazio")
    @Column(nullable = false)
    private Double percentualGordura;

    @NotNull(message = "Massa Muscular não pode estar vazia")
    @Column(nullable = false)
    private Double massaMuscular;

    @NotNull(message = "Taxa Metabolica não pode estar vazia")
    @Column(nullable = false)
    private Integer tmb;

    @NotNull(message = "IdadeMetabolica não pode estar vazia")
    @Column(nullable = false)
    private Integer idadeMetabolica;

    @NotNull(message = "Gordura Visceral não pode estar vazia")
    @Column(nullable = false)
    private Integer gorduraVisceral;

//    @NotNull(message = "Paciente não pode ser nulo")
//    @ManyToOne
//    @JoinColumn(name = "patient_id", nullable = false)
//    private PatientModel paciente;
}