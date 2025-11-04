package fitt_nutri.example.demo.dto.response;

import java.time.LocalDate;

public record PatientResponseDTO(Integer id,
                                 String nome,
                                 String email,
                                 String cpf,
                                 String dataNascimento,
                                 String sexo,
                                 String estadoCivil,
                                 LocalDate dataConsulta,
                                 String motivoConsulta,
                                 String comorbidade,
                                 Integer frequenciaAtividadeFisica
                                 ) {}
