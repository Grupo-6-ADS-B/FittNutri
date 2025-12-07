package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CPF;

public record PatientRequestDTO(

        @NotBlank(message = "Nome não pode estar vazio")
        String nome,

        @Email(message = "Email inválido")
        @NotBlank(message = "Email não pode estar vazio")
        String email,

        @CPF(message = "CPF inválido")
        @NotBlank(message = "CPF não pode estar vazio")
        String cpf,

        @NotBlank(message = "O campo telefone não pode estar vazio")
        String telefone,

        @NotBlank(message = "O campo estado não pode estar vazio")
        String estado,

        @NotBlank(message = "O campo cidade não pode estar vazio")
        String cidade,

        @NotBlank(message = "O campo sexo não pode estar vazio")
        String sexo,

        @NotBlank(message = "O campo etnia não pode estar vazio")
        String etnia,

        @NotNull(message = "O campo atividade não pode estar vazio")
        String atividade

) {}
