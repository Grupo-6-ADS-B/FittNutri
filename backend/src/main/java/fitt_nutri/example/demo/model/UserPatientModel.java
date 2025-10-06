package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "patients")
public class UserPatientModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Nome não pode estar vazio")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "A data de nascimento não pode estar vazia")
    @Past
    @Column(nullable = false)
    private LocalDate dataNascimento;

    @NotBlank(message = "O campo sexo não pode estar vazio")
    @Column(nullable = false)
    private String sexo;

    @NotBlank(message = "O campo estado civil não pode estar vazio")
    @Column(nullable = false)
    private String estadoCivil;

    @NotBlank(message = "O campo dataConsulta não pode estar vazio")
    @PastOrPresent
    @Column(nullable = false)
    private LocalDate dataConsulta;

    @NotBlank(message = "O campo motivoConsulta não pode estar vazio")
    @Column(nullable = false)
    private String motivoConsulta;

    @NotBlank(message = "O campo comorbidade não pode estar vazio")
    @Column(nullable = false)
    private String comorbidade;

    @NotBlank(message = "O campo frequenciaAtividadeFisica não pode estar vazio")
    @Column(nullable = false)
    private Integer frequenciaAtividadeFisica;

    @ManyToOne
    @JoinColumn(name = "nutricionista_id", nullable = false)
    private UserNutritionistModel nutricionista;

}
