package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "dados_antropometricos")
public class DadosAntropometricosModel {

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

    @NotBlank(message = "Taxa Metabolica não pode estar vazia")
    @Column(nullable = false)
    private Integer tmb;

    @NotBlank(message = "IdadeMetabolica não pode estar vazia")
    @Column(nullable = false)
    private Integer idadeMetabolica;

    @NotBlank(message = "Gordura Visceral não pode estar vazia")
    @Column(nullable = false)
    private Integer gorduraVisceral;

    @Column(nullable = false)
    @ManyToOne
    private Integer idUsuario;


}