package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record PatientRequestDTO(
        @NotBlank(message = "Nome não pode estar vazio")
        String nome,

        @Email(message = "Email inválido")
        @NotBlank(message = "Email não pode estar vazio")
        String email,

        @CPF(message = "CPF inválido")
        @NotBlank(message = "CPF não pode estar vazio")
        String cpf,

        @NotNull(message = "A data de nascimento não pode estar vazia")
        @Past(message = "A data de nascimento deve ser no passado")
        LocalDate dataNascimento,

        @NotBlank(message = "O campo sexo não pode estar vazio")
        String sexo,

        @NotBlank(message = "O campo estado civil não pode estar vazio")
        String estadoCivil,

        @NotNull(message = "O campo dataConsulta não pode estar vazio")
        @PastOrPresent(message = "A data da consulta não pode ser futura")
        LocalDate dataConsulta,

        @NotBlank(message = "O campo motivoConsulta não pode estar vazio")
        String motivoConsulta,

        @NotBlank(message = "O campo comorbidade não pode estar vazio")
        String comorbidade,

        @NotNull(message = "O campo frequenciaAtividadeFisica não pode estar vazio")
        @Min(value = 0, message = "Frequência mínima: 0")
        @Max(value = 7, message = "Frequência máxima: 7")
        Integer frequenciaAtividadeFisica
) {}
