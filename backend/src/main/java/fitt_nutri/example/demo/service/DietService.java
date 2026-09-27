package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.DietMealItemRequestDTO;
import fitt_nutri.example.demo.dto.request.DietMealRequestDTO;
import fitt_nutri.example.demo.dto.request.DietRequestDTO;
import fitt_nutri.example.demo.model.DietMealItemModel;
import fitt_nutri.example.demo.model.DietMealModel;
import fitt_nutri.example.demo.model.DietModel;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.repository.DietMealItemRepository;
import fitt_nutri.example.demo.repository.DietMealRepository;
import fitt_nutri.example.demo.repository.DietRepository;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DietService {

    private final DietRepository dietRepository;
    private final DietMealRepository mealRepository;
    private final DietMealItemRepository itemRepository;
    private final FoodItensRepository foodItensRepository;

    public Page<DietModel> findAll(Pageable pageable) {
        return dietRepository.findAll(pageable);
    }

    public Page<DietModel> findByNome(String nome, Pageable pageable) {
        return dietRepository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    public DietModel findById(Integer id) {
        return dietRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dieta não encontrada: " + id));
    }

    @Transactional
    public DietModel create(DietRequestDTO dto) {
        DietModel dieta = new DietModel();
        dieta.setNome(dto.getNome());
        dieta.setObservacao(dto.getObservacao());
        dietRepository.save(dieta);
        salvarRefeicoes(dieta, dto.getRefeicoes());
        return dieta;
    }

    @Transactional
    public DietModel update(Integer id, DietRequestDTO dto) {
        DietModel dieta = findById(id);
        dieta.setNome(dto.getNome());
        dieta.setObservacao(dto.getObservacao());

        List<DietMealModel> refeicoesAntigas = mealRepository.findByDietaIdOrderByHorario(id);
        for (DietMealModel refeicao : refeicoesAntigas) {
            itemRepository.deleteAll(itemRepository.findByRefeicaoId(refeicao.getId()));
        }
        mealRepository.deleteAll(refeicoesAntigas);

        salvarRefeicoes(dieta, dto.getRefeicoes());
        return dietRepository.save(dieta);
    }

    @Transactional
    public void delete(Integer id) {
        dietRepository.delete(findById(id));
    }

    private void salvarRefeicoes(DietModel dieta, List<DietMealRequestDTO> dtos) {
        if (dtos == null) return;
        for (DietMealRequestDTO dto : dtos) {
            DietMealModel refeicao = new DietMealModel();
            refeicao.setDieta(dieta);
            refeicao.setHorario(LocalTime.parse(dto.getHorario()));
            refeicao.setNome(dto.getNome());
            refeicao.setObservacao(dto.getObservacao());
            mealRepository.save(refeicao);

            if (dto.getItens() != null) {
                salvarItens(refeicao, dto.getItens());
            }
        }
    }

    private void salvarItens(DietMealModel refeicao, List<DietMealItemRequestDTO> dtos) {
        for (DietMealItemRequestDTO dto : dtos) {
            DietMealItemModel item = new DietMealItemModel();
            item.setRefeicao(refeicao);
            item.setDescricao(dto.getDescricao());
            item.setQuantidade(dto.getQuantidade() != null
                    ? new java.math.BigDecimal(dto.getQuantidade().toString()) : null);
            item.setUnidade(dto.getUnidade());
            item.setObservacao(dto.getObservacao());

            if (dto.getAlimentoId() != null) {
                FoodItensModel alimento = foodItensRepository.findById(dto.getAlimentoId())
                        .orElseThrow(() -> new RuntimeException("Alimento não encontrado: " + dto.getAlimentoId()));
                item.setAlimento(alimento);
            }

            itemRepository.save(item);
        }
    }
}