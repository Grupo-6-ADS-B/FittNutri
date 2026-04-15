package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record PatientRequestDTO(

        @NotBlank(message = "Nome não pode estar vazio")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @Email(message = "Email inválido")
        @NotBlank(message = "Email não pode estar vazio")
        @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
        String email,

        @CPF(message = "CPF inválido")
        @NotBlank(message = "CPF não pode estar vazio")
        @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres")
        String cpf,

        @NotBlank(message = "O campo telefone não pode estar vazio")
        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String telefone,

        @NotBlank(message = "O campo estado não pode estar vazio")
        @Size(max = 2, message = "Estado deve ter no máximo 2 caracteres")
        String estado,

        @NotBlank(message = "O campo cidade não pode estar vazio")
        @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
        String cidade,

        @NotBlank(message = "O campo sexo não pode estar vazio")
        @Size(max = 20, message = "Sexo deve ter no máximo 20 caracteres")
        String sexo,

        @NotBlank(message = "O campo etnia não pode estar vazio")
        @Size(max = 50, message = "Etnia deve ter no máximo 50 caracteres")
        String etnia,

        @NotNull(message = "O campo atividade não pode estar vazio")
        @Size(max = 50, message = "Atividade deve ter no máximo 50 caracteres")
        String atividade,

        @NotBlank(message = "O campo motivo da consulta não pode estar vazio")
        String motivoConsulta

) {}
