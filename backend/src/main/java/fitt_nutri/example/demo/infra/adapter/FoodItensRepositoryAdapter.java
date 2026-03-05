package fitt_nutri.example.demo.infra.adapter;

import fitt_nutri.example.demo.domain.port.out.FoodItensRepositoryPort;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FoodItensRepositoryAdapter implements FoodItensRepositoryPort {

    private final FoodItensRepository repo;

    @Override
    public Optional<FoodItensModel> findByNome(String nome) {
        return repo.findByNome(nome);
    }

    @Override
    public List<FoodItensModel> findByNomeContainingIgnoreCase(String nomeParte) {
        return repo.findByNomeContainingIgnoreCase(nomeParte);
    }

    @Override
    public Optional<FoodItensModel> findById(Integer id) {
        return repo.findById(id);
    }

    @Override
    public List<FoodItensModel> findAll() {
        return repo.findAll();
    }
}