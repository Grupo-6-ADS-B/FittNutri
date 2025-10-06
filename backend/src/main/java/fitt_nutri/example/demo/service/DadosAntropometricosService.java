package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exception.UsuarioNaoEncontrado;
import fitt_nutri.example.demo.repository.DadosAntropometricosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DadosAntropometricosService {

    @Autowired
    private DadosAntropometricosRepository repository;

    public List<DadosAntropometricosRepository> listarTodos() {
        return repository.findAll();
    }


    public DadosAntropometricosRepository criar(DadosAntropometricosRepository dados) {
        return repository.save(dados);
    }

    public void deletarPorId(Integer id) {

        if (!repository.existsById(id)) {
            throw new UsuarioNaoEncontrado("id " + id);
        }



        repository.deleteById(id);
    }

    public DadosAntropometricosRepository atualizar(DadosAntropometricosRepository dados) {
        return repository.save(dados);
    }
}
