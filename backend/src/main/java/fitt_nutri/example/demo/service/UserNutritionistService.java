package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.adapter.UserNutritionistAdapter;
import fitt_nutri.example.demo.dto.request.LoginRequest;
import fitt_nutri.example.demo.dto.request.UserNutritionistRequest;
import fitt_nutri.example.demo.dto.response.UserNutritionistResponse;
import fitt_nutri.example.demo.model.UserNutritionistModel;
import fitt_nutri.example.demo.repository.UserNutritionistRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserNutritionistService {

    private final UserNutritionistRepository repository;

    public UserNutritionistService(UserNutritionistRepository repository) {
        this.repository = repository;
    }

    public UserNutritionistResponse cadastrar(UserNutritionistRequest request) {
        if (repository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("E-mail já cadastrado");

        if (repository.existsByCpf(request.getCpf()))
            throw new IllegalArgumentException("CPF já cadastrado");

        if (repository.existsByCrn(request.getCrn()))
            throw new IllegalArgumentException("CRN já cadastrado");

        UserNutritionistModel model = UserNutritionistAdapter.toModel(request);
        UserNutritionistModel saved = repository.save(model);
        return UserNutritionistAdapter.toResponse(saved);
    }

    public List<UserNutritionistResponse> listarTodos() {
        return repository.findAll()
                .stream()
                .map(UserNutritionistAdapter::toResponse)
                .collect(Collectors.toList());
    }

    public UserNutritionistResponse buscarPorId(Integer id) {
        UserNutritionistModel user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return UserNutritionistAdapter.toResponse(user);
    }

    public UserNutritionistResponse atualizar(Integer id, UserNutritionistRequest request) {
        UserNutritionistModel existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        existing.setNome(request.getNome());
        existing.setEmail(request.getEmail());
        existing.setCpf(request.getCpf());
        existing.setCrn(request.getCrn());
        existing.setSenha(request.getSenha());

        UserNutritionistModel updated = repository.save(existing);
        return UserNutritionistAdapter.toResponse(updated);
    }

    public void excluir(Integer id) {
        if (!repository.existsById(id))
            throw new IllegalArgumentException("Usuário não encontrado");

        repository.deleteById(id);
    }

    public UserNutritionistResponse login(LoginRequest loginRequest) {
        UserNutritionistModel user = repository.findAll().stream()
                .filter(u -> u.getEmail().equals(loginRequest.getEmail()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        if (!user.getSenha().equals(loginRequest.getSenha()))
            throw new IllegalArgumentException("Senha incorreta");

        return UserNutritionistAdapter.toResponse(user);
    }
}
