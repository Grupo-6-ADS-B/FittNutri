package fitt_nutri.example.demo.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ia")
public class AnaliseNutricionalController {

    private final IaGenerativaService iaGenerativaService;

    public AnaliseNutricionalController(IaGenerativaService iaGenerativaService) {
        this.iaGenerativaService = iaGenerativaService;
    }

    @PostMapping("/analise-nutricional")
    public ResponseEntity<AnaliseNutricionalIA> analisar(
            @Valid @RequestBody DadosPacienteIA dados) {

        return ResponseEntity.ok(iaGenerativaService.analisar(dados));
    }
}
