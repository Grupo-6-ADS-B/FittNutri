package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.exceptions.DadosInvalidosException;
import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import fitt_nutri.example.demo.service.DataCircleService;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/data-circle")
@RequiredArgsConstructor

public class DataCircleController {


    private final DataCircleService service;
    private final DataCircleRepository dataCircleRepository;


    @PostMapping
    public ResponseEntity<String> cadastrar(@RequestBody DataCircleModel dataCircleModel) {

        try {
            service.cadastrar(dataCircleModel);

            return ResponseEntity.status(201).build();

        } catch (DadosInvalidosException ex) {
            return ResponseEntity
                    .status(400)
                    .body(ex.getMessage());
        }
    }


    @GetMapping
    public ResponseEntity<List<DataCircleModel>> pegarTodos(){

        List<DataCircleModel> list = new ArrayList<>();
        list = dataCircleRepository.findAll(); // tem que refatorar isso daqui pra jogar pra service, mas antes tem que terminar os metodos http

        if (list == null || list.isEmpty()) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.status(200).body(list);


    }


    @GetMapping("/{id}")
    public ResponseEntity<DataCircleModel> pegarPorId(@PathVariable Integer id){

        if(id == null || id <= 0){
            return ResponseEntity.status(400).build();
        }

        DataCircleModel dataCircleModel = (DataCircleModel) dataCircleRepository.findById(id).orElse(null);

        if(dataCircleModel == null){
            return ResponseEntity.status(404).build();
        }



        if (dataCircleRepository.existsById(id)) {
            return ResponseEntity.status(200).body(dataCircleModel);
        }
        return ResponseEntity.status(404).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DataCircleModel> atualizar(@PathVariable Integer id, @RequestBody DataCircleModel dataCircleModel){

        if(id == null || id <= 0){
            return ResponseEntity.status(400).build();
        }

        if(dataCircleModel == null){
            return ResponseEntity.status(400).build();
        }


        if(!dataCircleRepository.existsById(id)){
            return ResponseEntity.status(404).build();
        }

        dataCircleModel.setIdDadosCircunferencia(id);
        DataCircleModel updatedModel = dataCircleRepository.save(dataCircleModel);
        return ResponseEntity.status(200).body(updatedModel);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DataCircleModel> atualizarParcial(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates) {

        if (id == null || id <= 0) {
            return ResponseEntity.status(400).build();
        }

        DataCircleModel dataCircleModel = dataCircleRepository.findById(id).orElse(null);

        if (dataCircleModel == null) {
            return ResponseEntity.status(404).build();
        }

        updates.forEach((chave, valor) -> {
            try {
                switch (chave) {
                    case "abdominal":
                        dataCircleModel.setAbdominal(Double.valueOf(valor.toString()));
                        break;
                    case "cintura":
                        dataCircleModel.setCintura(Double.valueOf(valor.toString()));
                        break;
                    case "quadril":
                        dataCircleModel.setQuadril(Double.valueOf(valor.toString()));
                        break;
                    case "pulso":
                        dataCircleModel.setPulso(Double.valueOf(valor.toString()));
                        break;
                    case "panturrilha":
                        dataCircleModel.setPanturrilha(Double.valueOf(valor.toString()));
                        break;
                    case "braco":
                        dataCircleModel.setBraco(Double.valueOf(valor.toString()));
                        break;
                    case "coxa":
                        dataCircleModel.setCoxa(Double.valueOf(valor.toString()));
                        break;
                    case "pesoIdeal":
                        dataCircleModel.setPesoIdeal(Double.valueOf(valor.toString()));
                        break;
                    default:
                        // Campo não encontrado — pode ignorar ou lançar erro
                        break;
                }
            } catch (Exception e) {
                // Tratamento de erro para valores inválidos
                System.out.println("Erro ao atualizar campo " + chave + ": " + e.getMessage());
            }
        });

        dataCircleRepository.save(dataCircleModel);
        return ResponseEntity.ok(dataCircleModel);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (id == null || id <= 0) {
            return ResponseEntity.status(400).build();
        }

        if (!dataCircleRepository.existsById(id)) {
            return ResponseEntity.status(404).build();
        }

        dataCircleRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }


    @GetMapping("/count")
    public ResponseEntity<Long> contarRegistros() {
        return ResponseEntity.ok(dataCircleRepository.count());
    }




}
