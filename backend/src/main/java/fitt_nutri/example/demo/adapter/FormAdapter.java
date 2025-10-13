package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.FormRequestDTO;
import fitt_nutri.example.demo.dto.response.FormResponseDTO;
import fitt_nutri.example.demo.model.FormModel;
import fitt_nutri.example.demo.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormAdapter {

    private final FormService service;

    public FormResponseDTO create(FormRequestDTO dto) {
        FormModel form = service.createForm(dto);
        return toDTO(form);
    }

    public FormResponseDTO getById(Integer id) {
        FormModel form = service.getFormById(id);
        return toDTO(form);
    }

    public List<FormResponseDTO> getAll() {
        return service.getAllForms()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public FormResponseDTO update(Integer id, FormRequestDTO dto) {
        FormModel form = service.updateForm(id, dto);
        return toDTO(form);
    }

    public void delete(Integer id) {
        service.deleteForm(id);
    }

    private FormResponseDTO toDTO(FormModel form) {
        return new FormResponseDTO(
                form.getId(),
                form.getNome(),
                form.getMensagem()
        );
    }
}
