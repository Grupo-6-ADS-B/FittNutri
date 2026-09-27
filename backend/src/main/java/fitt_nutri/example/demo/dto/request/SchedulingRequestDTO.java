package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record SchedulingRequestDTO(
        @NotNull(message = "O id do paciente é obrigatório")
        Integer pacienteId,

        @NotNull(message = "O id do nutricionista é obrigatório")
        Integer usuarioId,

        @NotNull(message = "A data agendada é obrigatória")
        LocalDateTime dataAgendada,

        @Size(max = 500, message = "Observações devem ter no máximo 500 caracteres")
        String observacoes
) {}
