package fitt_nutri.example.demo.dto.response;

import java.time.LocalDate;

public record SchedulingResponseDTO(
        Integer id,
        String pacienteNome,
        String nutricionistaNome,
        LocalDate dataAgendada,
        String observacoes
) {}
