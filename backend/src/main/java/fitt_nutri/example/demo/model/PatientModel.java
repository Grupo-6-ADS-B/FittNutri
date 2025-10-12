package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Paciente")
public class PatientModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Nome não pode estar vazio")
    @Column(nullable = false)
    private String nome;

    @Email
    @NotBlank(message = "Email não pode estar vazio")
    @Column(nullable = false)
    private String email;

    @CPF
    @NotBlank(message = "CPF não pode estar vazio")
    @Column(nullable = false)
    private String cpf;

    @NotNull(message = "A data de nascimento não pode estar vazia")
    @Past(message = "A data de nascimento deve ser no passado")
    @Column(nullable = false)
    private LocalDate dataNascimento;

    @NotBlank(message = "O campo sexo não pode estar vazio")
    @Column(nullable = false)
    private String sexo;

    @NotBlank(message = "O campo estado civil não pode estar vazio")
    @Column(nullable = false)
    private String estadoCivil;

    @NotNull(message = "O campo dataConsulta não pode estar vazio")
    @PastOrPresent(message = "A data da consulta não pode ser futura")
    @Column(nullable = false)
    private LocalDate dataConsulta;

    @NotBlank(message = "O campo motivoConsulta não pode estar vazio")
    @Column(nullable = false)
    private String motivoConsulta;

    @NotBlank(message = "O campo comorbidade não pode estar vazio")
    @Column(nullable = false)
    private String comorbidade;

    @NotNull(message = "O campo frequenciaAtividadeFisica não pode estar vazio")
    @Min(value = 0, message = "Frequência mínima: 0")
    @Max(value = 7, message = "Frequência máxima: 7")
    @Column(nullable = false)
    private Integer frequenciaAtividadeFisica;
}
