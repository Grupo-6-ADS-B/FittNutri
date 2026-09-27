package fitt_nutri.example.demo.dto.response;

import java.time.LocalDateTime;

public record SchedulingResponseDTO(
        Integer id,
        String pacienteNome,
        String nutricionistaNome,
        LocalDateTime dataAgendada,
        String observacoes
) {}
