package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.service.DataCircleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/data-circle")
@RequiredArgsConstructor
@Tag(name ="Dados Circunferência" , description = "CRUD para gerenciar os dados de circunferência")
public class DataCircleController {


    private final DataCircleService service;
    // Removido: private final DataCircleRepository dataCircleRepository; (não é mais necessário)


    @PostMapping
    @Operation(summary = "Cria um novo registro de dados de circunferência")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Registro criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Requisição inválida"),
            @ApiResponse(responseCode = "409", description = "Conflito: Rótulo já existe") // Documentação 409 Adicionada
    })
    public ResponseEntity<DataCircleModel> cadastrar(@Valid @RequestBody DataCircleModel dataCircleModel) {
        return ResponseEntity.status(201).body(service.cadastrar(dataCircleModel));
    }


    @GetMapping
    @Operation(summary = "Recupera todos os registros de dados de circunferência")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registros recuperados com sucesso"),
            @ApiResponse(responseCode = "404", description = "Nenhum registro encontrado")
    })
    public ResponseEntity<List<DataCircleModel>> pegarTodos(){

        List<DataCircleModel> dadosRecuperados = service.pegarTodos();
        return ResponseEntity.status(200).body(dadosRecuperados);

    }


    @GetMapping("/{id}")
    @Operation(summary = "Recupera um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro recuperado com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado")
    })
    public ResponseEntity<DataCircleModel> pegarPorId(@PathVariable Integer id){
        return ResponseEntity.status(200).body(service.pegarPorId(id));
    }



    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido ou dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito: Rótulo já existe") // Documentação 409 Adicionada
    })
    public ResponseEntity<DataCircleModel> atualizar(@PathVariable Integer id, @RequestBody DataCircleModel dataCircleModel){
        return ResponseEntity.status(200).body(service.atualizar(id, dataCircleModel));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro atualizado parcialmente com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido ou dados inválidos no corpo da requisição"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito: Rótulo já existe") // Documentação 409 Adicionada
    })
    public ResponseEntity<DataCircleModel> atualizarParcial(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates) {

        // A lógica de busca, validação e aplicação das atualizações foi movida para o Service.
        DataCircleModel updatedModel = service.atualizarParcial(id, updates);
        return ResponseEntity.ok(updatedModel);
    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Deleta um registro de dados de circunferência pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Registro deletado com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID inválido"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado")
    })
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }


    @GetMapping("/count")
    @Operation(summary = "Conta o número total de registros")
    public ResponseEntity<Long> contarRegistros() {
        return ResponseEntity.ok(service.contarRegistros());
    }

}
