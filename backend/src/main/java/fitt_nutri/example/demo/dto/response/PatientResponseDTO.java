package fitt_nutri.example.demo.dto.response;

public record PatientResponseDTO(
        Integer id,
        String nome,
        String email,
        String cpf,
        String telefone,
        String estado,
        String cidade,
        String sexo,
        String etnia,
        String atividade,
        Integer nutriId) {}
