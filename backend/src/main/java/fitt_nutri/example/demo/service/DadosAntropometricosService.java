package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exception.DadoJaExistente;
import fitt_nutri.example.demo.exception.DadoNaoEncontrado;
import fitt_nutri.example.demo.exception.UsuarioNaoEncontrado;
import fitt_nutri.example.demo.model.DadosAntropometricosModel;
import fitt_nutri.example.demo.repository.DadosAntropometricosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DadosAntropometricosService {

    @Autowired
    private DadosAntropometricosRepository repository;

    public List<DadosAntropometricosModel> listarTodos() {
        if(repository.findAll().isEmpty()){
            throw new UsuarioNaoEncontrado("Nenhum dado antropométrico cadastrado");
        }
        return repository.findAll();
    }

    public DadosAntropometricosModel listarPorId(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontrado("id " + id + " não encontrado"));
    }

    public DadosAntropometricosModel criar(DadosAntropometricosModel dados) {
        if (dados.getIdDadosAntropometricos() != null && repository.existsById(dados.getIdDadosAntropometricos())) {
            throw new DadoJaExistente("id " + dados.getIdDadosAntropometricos() + " já existe");
        }
        if (dados.getAltura() > 2.60 || dados.getAltura() <= 0) {
            throw new DadoNaoEncontrado("Altura inválida");
        }
        if (dados.getPeso() > 300.2 || dados.getPeso() <= 0) {
            throw new DadoNaoEncontrado("Peso inválido");
        }
        if (dados.getTmb() > 3000 || dados.getTmb() <= 0) {
            throw new DadoNaoEncontrado("Taxa Metabólica inválida");
        }
        if (dados.getPercentualGordura() > 100 || dados.getPercentualGordura() <= 0) {
            throw new DadoNaoEncontrado("Percentual de gordura inválido");
        }
        if (dados.getGorduraVisceral() > 60){
            throw new DadoNaoEncontrado("Gordura visceral inválida");
        }
        return repository.save(dados);
    }


    public void deletarPorId(Integer id) {
        if (!repository.existsById(id)) {
            throw new UsuarioNaoEncontrado("id " + id + " não encontrado");
        }
        repository.deleteById(id);
    }

    public DadosAntropometricosModel atualizar(DadosAntropometricosModel dados) {
        return repository.save(dados);
    }
}