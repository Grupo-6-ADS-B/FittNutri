package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.adapter.UserNutritionistAdapter;
import fitt_nutri.example.demo.dto.request.LoginRequest;
import fitt_nutri.example.demo.dto.request.UserNutritionistRequest;
import fitt_nutri.example.demo.dto.response.UserNutritionistResponse;
import fitt_nutri.example.demo.model.UserNutritionistModel;
import fitt_nutri.example.demo.repository.UserNutritionistRepository;
import fitt_nutri.example.demo.security.JwtUtil;
import fitt_nutri.example.demo.exceptions.ResourceNotFoundException;
import fitt_nutri.example.demo.exceptions.AuthenticationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserNutritionistService {

    private final UserNutritionistRepository repository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserNutritionistResponse cadastrar(@Valid UserNutritionistRequest request) {
        if (repository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("E-mail já cadastrado");

        if (repository.existsByCpf(request.getCpf()))
            throw new IllegalArgumentException("CPF já cadastrado");

        if (repository.existsByCrn(request.getCrn()))
            throw new IllegalArgumentException("CRN já cadastrado");

        request.setSenha(passwordEncoder.encode(request.getSenha()));

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
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return UserNutritionistAdapter.toResponse(user);
    }

    public UserNutritionistResponse atualizar(Integer id, UserNutritionistRequest request) {
        UserNutritionistModel existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        existing.setNome(request.getNome());
        existing.setEmail(request.getEmail());
        existing.setCpf(request.getCpf());
        existing.setCrn(request.getCrn());

        existing.setSenha(passwordEncoder.encode(request.getSenha()));

        UserNutritionistModel updated = repository.save(existing);
        return UserNutritionistAdapter.toResponse(updated);
    }

    public void excluir(Integer id) {
        if (!repository.existsById(id))
            throw new ResourceNotFoundException("Usuário não encontrado");

        repository.deleteById(id);
    }

    public UserNutritionistResponse login(LoginRequest loginRequest) {
        UserNutritionistModel user = repository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new AuthenticationException("Usuário não encontrado"));

        if (!passwordEncoder.matches(loginRequest.getSenha(), user.getSenha()))
            throw new AuthenticationException("Senha incorreta");

        String token = jwtUtil.generateToken(user.getEmail());
        UserNutritionistResponse response = UserNutritionistAdapter.toResponse(user);
        response.setToken(token);
        return response;
    }
}
