package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.FormRequestDTO;
import fitt_nutri.example.demo.dto.response.FormResponseDTO;
import fitt_nutri.example.demo.model.FormModel;
import fitt_nutri.example.demo.repository.FormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormService {

    private final FormRepository formRepository;

    public FormModel createForm(FormRequestDTO dto) {
        if (dto.nome() == null || dto.nome().isBlank()) {
            throw new IllegalArgumentException("Nome não pode estar vazio");
        } else if (dto.mensagem() == null || dto.mensagem().isBlank()) {
            throw new IllegalArgumentException("Mensagem não pode estar vazia");
        }
        FormModel model = new FormModel();
        model.setNome(dto.nome());
        model.setMensagem(dto.mensagem());
        return formRepository.save(model);
    }

    public List<FormModel> getAllForms() {
        return formRepository.findAll();
    }

    public FormModel getFormById(Integer id) {
        Optional<FormModel> formOpt = formRepository.findById(id);
        if (formOpt.isPresent()) {
            return formOpt.get();
        } else {
            throw new IllegalArgumentException("Formulário não encontrado");
        }
    }

    public FormModel updateForm(Integer id, FormRequestDTO dto) {
        if (!formRepository.existsById(id)) {
            throw new IllegalArgumentException("Formulário não encontrado");
        } else if (dto.nome() == null || dto.nome().isBlank()) {
            throw new IllegalArgumentException("Nome não pode estar vazio");
        } else if (dto.mensagem() == null || dto.mensagem().isBlank()) {
            throw new IllegalArgumentException("Mensagem não pode estar vazia");
        }

        FormModel model = new FormModel();
        model.setId(id);
        model.setNome(dto.nome());
        model.setMensagem(dto.mensagem());
        return formRepository.save(model);
    }

    public void deleteForm(Integer id) {
        if (!formRepository.existsById(id)) {
            throw new IllegalArgumentException("Formulário não encontrado");
        }
        formRepository.deleteById(id);
    }

    // ===== MÉTODOS COM RETORNO DTO (para Controller) =====

    public FormResponseDTO createFormAndReturn(FormRequestDTO dto) {
        FormModel form = createForm(dto);
        return toResponseDTO(form);
    }

    public FormResponseDTO getFormByIdAndReturn(Integer id) {
        FormModel form = getFormById(id);
        return toResponseDTO(form);
    }

    public List<FormResponseDTO> getAllFormsAndReturn() {
        return getAllForms()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public FormResponseDTO updateFormAndReturn(Integer id, FormRequestDTO dto) {
        FormModel form = updateForm(id, dto);
        return toResponseDTO(form);
    }

    private FormResponseDTO toResponseDTO(FormModel form) {
        return new FormResponseDTO(
                form.getId(),
                form.getNome(),
                form.getMensagem()
        );
    }
}
