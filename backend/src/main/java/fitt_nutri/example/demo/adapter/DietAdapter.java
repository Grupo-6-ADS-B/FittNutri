package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.DietRequestDTO;
import fitt_nutri.example.demo.dto.response.DietMealItemResponseDTO;
import fitt_nutri.example.demo.dto.response.DietMealResponseDTO;
import fitt_nutri.example.demo.dto.response.DietResponseDTO;
import fitt_nutri.example.demo.model.DietMealItemModel;
import fitt_nutri.example.demo.model.DietMealModel;
import fitt_nutri.example.demo.model.DietModel;
import fitt_nutri.example.demo.repository.DietMealItemRepository;
import fitt_nutri.example.demo.repository.DietMealRepository;
import fitt_nutri.example.demo.service.DietService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DietAdapter {

    private final DietService service;
    private final DietMealRepository mealRepository;
    private final DietMealItemRepository itemRepository;

    public Page<DietResponseDTO> getAll(Pageable pageable) {
        return service.findAll(pageable).map(this::mapToDTO);
    }

    public Page<DietResponseDTO> search(String nome, Pageable pageable) {
        return service.findByNome(nome, pageable).map(this::mapToDTO);
    }

    public DietResponseDTO getById(Integer id) {
        return mapToDTO(service.findById(id));
    }

    public DietResponseDTO create(DietRequestDTO dto) {
        return mapToDTO(service.create(dto));
    }

    public DietResponseDTO update(Integer id, DietRequestDTO dto) {
        return mapToDTO(service.update(id, dto));
    }

    public void delete(Integer id) {
        service.delete(id);
    }

    private DietResponseDTO mapToDTO(DietModel d) {
        List<DietMealModel> refeicoes = mealRepository.findByDietaIdOrderByHorario(d.getId());

        List<DietMealResponseDTO> refeicoesDTO = refeicoes.stream()
                .map(r -> {
                    List<DietMealItemModel> itens = itemRepository.findByRefeicaoId(r.getId());

                    List<DietMealItemResponseDTO> itensDTO = itens.stream()
                            .map(i -> {
                                DietMealItemResponseDTO itemDTO = new DietMealItemResponseDTO();
                                itemDTO.setId(i.getId());
                                itemDTO.setAlimentoId(i.getAlimento() != null ? i.getAlimento().getId() : null);
                                itemDTO.setNomeAlimento(i.getAlimento() != null ? i.getAlimento().getNome() : null);
                                itemDTO.setDescricao(i.getDescricao());
                                itemDTO.setQuantidade(i.getQuantidade());
                                itemDTO.setUnidade(i.getUnidade());
                                itemDTO.setObservacao(i.getObservacao());
                                return itemDTO;
                            })
                            .toList();

                    DietMealResponseDTO refeicaoDTO = new DietMealResponseDTO();
                    refeicaoDTO.setId(r.getId());
                    refeicaoDTO.setHorario(r.getHorario().toString());
                    refeicaoDTO.setNome(r.getNome());
                    refeicaoDTO.setObservacao(r.getObservacao());
                    refeicaoDTO.setItens(itensDTO);
                    return refeicaoDTO;
                })
                .toList();

        DietResponseDTO dto = new DietResponseDTO();
        dto.setId(d.getId());
        dto.setNome(d.getNome());
        dto.setObservacao(d.getObservacao());
        dto.setCriadoEm(d.getCriadoEm());
        dto.setRefeicoes(refeicoesDTO);
        return dto;
    }
}