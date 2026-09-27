package fitt_nutri.example.demo.dto.response;

import java.time.LocalDate;

/**
 * DTO de resposta para o histórico de consultas de um paciente.
 *
 * Existe para não expor as entidades JPA cruas: PatientHistoryModel.patientModel
 * referencia UserModel.pacientes de volta, e como nenhum dos dois lados tem
 * @JsonManagedReference/@JsonBackReference, serializar a entidade diretamente
 * causa recursão infinita (patientModel -> nutricionista -> pacientes -> ...)
 * e, de quebra, vazava o hash da senha do nutricionista na resposta.
 */
public record PatientHistoryResponseDTO(
        Long id,
        LocalDate dataConsulta,
        String motivoConsulta,
        AnthropometricDataResponseDTO anthropometricDataModel,
        DataCircleResponseDTO dataCircleModel
) {
    public record AnthropometricDataResponseDTO(
            Integer id,
            Double peso,
            Double altura,
            Integer idade,
            Double imc,
            Double porcentagemGordura,
            Double massaMuscular,
            Double gorduraVisceral,
            Double taxaMetabolicaBasal,
            Integer idadeMetabolica
    ) {}

    public record DataCircleResponseDTO(
            Integer id,
            Double abdominal,
            Double cintura,
            Double quadril,
            Double pulso,
            Double panturrilha,
            Double braco,
            Double coxa,
            Double pesoIdeal
    ) {}
}
