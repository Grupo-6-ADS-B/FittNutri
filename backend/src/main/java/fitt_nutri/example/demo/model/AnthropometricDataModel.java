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

    private Double peso;

    private Double altura;

    private Integer idade;

    private Double imc;

    private Double porcentagemGordura;

    private Double massaMuscular;

    private Double gorduraVisceral;

    private Integer taxaMetabolicaBasal;

    private Integer idadeMetabolica;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientModel paciente;
}