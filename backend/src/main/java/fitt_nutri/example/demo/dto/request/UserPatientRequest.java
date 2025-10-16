package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserPatientRequest {

    @NotBlank(message = "Nome não pode estar vazio")
    private String nome;

    @NotNull(message = "Data de nascimento não pode estar vazia")
    @Past(message = "Data de nascimento deve ser no passado")
    private LocalDate dataNascimento;

    @NotBlank(message = "Sexo não pode estar vazio")
    private String sexo;

    @NotBlank(message = "Estado civil não pode estar vazio")
    private String estadoCivil;

    @NotNull(message = "Data da consulta não pode estar vazia")
    @PastOrPresent(message = "Data da consulta deve ser no passado ou presente")
    private LocalDate dataConsulta;

    @NotBlank(message = "Motivo da consulta não pode estar vazio")
    private String motivoConsulta;

    @NotBlank(message = "Comorbidade não pode estar vazia")
    private String comorbidade;

    @NotNull(message = "Frequência de atividade física não pode estar vazia")
    private Integer frequenciaAtividadeFisica;
}
