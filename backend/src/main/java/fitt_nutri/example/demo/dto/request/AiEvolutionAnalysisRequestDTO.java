package fitt_nutri.example.demo.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class AiEvolutionAnalysisRequestDTO {

    private List<EvolutionDataDTO> evolution;

    @Data
    public static class EvolutionDataDTO {

        private String dataConsulta;
        private Double peso;
        private Double imc;
        private Double gordura;
        private Double massaMuscular;
        private Double gorduraVisceral;
    }
}
