package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.repository.DadosAntropometricosRepository;
import fitt_nutri.example.demo.service.DadosAntropometricosService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

    @RestController
    @RequestMapping("/dados-antropometricos")
    public class DadosAntropometricosController {

        @Autowired
        private DadosAntropometricosService service;

        @GetMapping
        public List<DadosAntropometricosRepository> listarTodos() {
            return service.listarTodos();
        }

        @PostMapping
        public DadosAntropometricosRepository criar(@RequestBody DadosAntropometricosRepository dados) {
            return service.criar(dados);
        }

        @PutMapping
        public DadosAntropometricosRepository atualizar(@RequestBody DadosAntropometricosRepository dados) {
            return service.atualizar(dados);
        }

        @DeleteMapping("/{id}")
        public void deletar(@PathVariable Integer id) {
            service.deletarPorId(id);
        }
    }

