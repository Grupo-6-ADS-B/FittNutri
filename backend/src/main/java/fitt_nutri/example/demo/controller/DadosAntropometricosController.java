package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.exception.DadoJaExistente;
import fitt_nutri.example.demo.exception.DadoNaoEncontrado;
import fitt_nutri.example.demo.exception.RequisicaoInvalida;
import fitt_nutri.example.demo.exception.UsuarioNaoEncontrado;
import fitt_nutri.example.demo.model.DadosAntropometricosModel;
import fitt_nutri.example.demo.repository.DadosAntropometricosRepository;
//import fitt_nutri.example.demo.service.DadosAntropometricosService;
import fitt_nutri.example.demo.service.DadosAntropometricosService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dados-antropometricos")
@AllArgsConstructor
public class DadosAntropometricosController {

    private final DadosAntropometricosService service;

    @Operation(summary = "Lista todos os dados antropométricos")
    @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso")
    @ApiResponse(responseCode = "404", description = "Nenhum dado encontrado")
    @GetMapping
    public ResponseEntity<List<DadosAntropometricosModel>> listarTodos() {
        try {
            List<DadosAntropometricosModel> dados = service.listarTodos();
            return ResponseEntity.ok(dados);
        } catch (UsuarioNaoEncontrado ex) {
            return ResponseEntity.status(404).build();
        }
    }

    @Operation(summary = "Busca dados antropométricos por ID")
    @ApiResponse(responseCode = "200", description = "Dado encontrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<DadosAntropometricosModel> buscarPorId(@PathVariable Integer id) {
        try {
            DadosAntropometricosModel dado = service.listarPorId(id);
            return ResponseEntity.ok(dado);
        } catch (UsuarioNaoEncontrado ex) {
            return ResponseEntity.status(404).build();
        }
    }

    @Operation(summary = "Cadastra novos dados antropométricos")
    @ApiResponse(responseCode = "201", description = "Dados cadastrados com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou ausentes")
    @ApiResponse(responseCode = "409", description = "ID já existente no sistema")
    @PostMapping
    public ResponseEntity<DadosAntropometricosModel> cadastrarDadosAntropometricos(@Valid @RequestBody DadosAntropometricosModel dados) {
        try {
            DadosAntropometricosModel criado = service.criar(dados);
            return ResponseEntity.status(201).body(criado);
        } catch (DadoJaExistente ex) {
            return ResponseEntity.status(409).build();
        } catch (DadoNaoEncontrado ex) {
            return ResponseEntity.status(400).build();
        }
    }

    @Operation(summary = "Atualiza dados antropométricos por ID")
    @ApiResponse(responseCode = "200", description = "Dados atualizados com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    @PutMapping("/{id}")
    public ResponseEntity<DadosAntropometricosModel> atualizar(@PathVariable Integer id, @RequestBody DadosAntropometricosModel dados) {
        try {
            dados.setIdDadosAntropometricos(id);
            DadosAntropometricosModel atualizado = service.atualizar(dados);
            return ResponseEntity.ok(atualizado);
        } catch (DadoNaoEncontrado ex) {
            return ResponseEntity.status(404).build();
        } catch (DadoJaExistente ex) {
            return ResponseEntity.status(409).build();
        }
    }

    @Operation(summary = "Exclui dados antropométricos por ID")
    @ApiResponse(responseCode = "204", description = "Dados deletados com sucesso")
    @ApiResponse(responseCode = "404", description = "Dado com o ID fornecido não encontrado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        try {
            service.deletarPorId(id);
            return ResponseEntity.noContent().build();
        } catch (UsuarioNaoEncontrado ex) {
            return ResponseEntity.status(404).build();
        } catch (RequisicaoInvalida ex) {
            return ResponseEntity.status(400).build();
        }
    }
}
