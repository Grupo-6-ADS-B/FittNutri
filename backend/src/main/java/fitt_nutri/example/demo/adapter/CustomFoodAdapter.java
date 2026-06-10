package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.CustomFoodRequestDTO;
import fitt_nutri.example.demo.dto.response.CustomFoodResponseDTO;
import fitt_nutri.example.demo.model.CustomFoodModel;
import fitt_nutri.example.demo.service.CustomFoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomFoodAdapter {

    private final CustomFoodService service;

    public Page<CustomFoodResponseDTO> getAll(Pageable pageable) {
        return service.findAll(pageable).map(this::mapToDTO);
    }

    public Page<CustomFoodResponseDTO> search(String nome, Pageable pageable) {
        return service.findByNome(nome, pageable).map(this::mapToDTO);
    }

    public CustomFoodResponseDTO getById(Integer id) {
        return mapToDTO(service.findById(id));
    }

    public CustomFoodResponseDTO create(CustomFoodRequestDTO dto) {
        return mapToDTO(service.create(dto));
    }

    public CustomFoodResponseDTO update(Integer id, CustomFoodRequestDTO dto) {
        return mapToDTO(service.update(id, dto));
    }

    public void delete(Integer id) {
        service.delete(id);
    }

    private CustomFoodResponseDTO mapToDTO(CustomFoodModel m) {
        return new CustomFoodResponseDTO(
                m.getId(), m.getNome(), m.getTipoMacro(), m.getPorcaoG(),
                m.getEnergiaKcal(), m.getProteina(), m.getLipideos(),
                m.getCarboidrato(), m.getFibra(), m.getSodio()
        );
    }
}