package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.CustomFoodRequestDTO;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.model.CustomFoodModel;
import fitt_nutri.example.demo.model.CustomFoodModel.TipoMacro;
import fitt_nutri.example.demo.repository.CustomFoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomFoodService {

    private final CustomFoodRepository repository;

    public Page<CustomFoodModel> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<CustomFoodModel> findByNome(String nome, Pageable pageable) {
        return repository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    public CustomFoodModel findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alimento customizado não encontrado: " + id));
    }

    public CustomFoodModel create(CustomFoodRequestDTO dto) {
        validarTipoMacro(dto);
        return mapAndSave(new CustomFoodModel(), dto);
    }

    public CustomFoodModel update(Integer id, CustomFoodRequestDTO dto) {
        validarTipoMacro(dto);
        return mapAndSave(findById(id), dto);
    }

    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    private void validarTipoMacro(CustomFoodRequestDTO dto) {
        if (dto.tipoMacro() == TipoMacro.total && dto.porcaoG() == null) {
            throw new InvalidDataException("porcaoG é obrigatório quando tipoMacro for 'total'");
        }
    }

    private CustomFoodModel mapAndSave(CustomFoodModel model, CustomFoodRequestDTO dto) {
        model.setNome(dto.nome());
        model.setTipoMacro(dto.tipoMacro());
        model.setPorcaoG(dto.porcaoG());
        model.setEnergiaKcal(dto.energiaKcal());
        model.setProteina(dto.proteina());
        model.setLipideos(dto.lipideos());
        model.setCarboidrato(dto.carboidrato());
        model.setFibra(dto.fibra());
        model.setSodio(dto.sodio());
        return repository.save(model);
    }
}