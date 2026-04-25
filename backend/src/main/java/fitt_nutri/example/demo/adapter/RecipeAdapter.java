package fitt_nutri.example.demo.adapter;

import fitt_nutri.example.demo.dto.request.RecipeRequestDTO;
import fitt_nutri.example.demo.dto.response.RecipeResponseDTO;
import fitt_nutri.example.demo.dto.response.RecipeResponseDTO.*;
import fitt_nutri.example.demo.model.RecipeIngredientModel;
import fitt_nutri.example.demo.model.RecipeModel;
import fitt_nutri.example.demo.repository.RecipeIngredientRepository;
import fitt_nutri.example.demo.service.RecipeService;
import fitt_nutri.example.demo.service.RecipeService.MacrosReceita;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RecipeAdapter {

    private final RecipeService service;
    private final RecipeIngredientRepository ingredienteRepository;

    public Page<RecipeResponseDTO> getAll(Pageable pageable) {
        return service.findAll(pageable).map(this::mapToDTO);
    }

    public Page<RecipeResponseDTO> search(String nome, Pageable pageable) {
        return service.findByNome(nome, pageable).map(this::mapToDTO);
    }

    public RecipeResponseDTO getById(Integer id) {
        return mapToDTO(service.findById(id));
    }

    public RecipeResponseDTO create(RecipeRequestDTO dto) {
        return mapToDTO(service.create(dto));
    }

    public RecipeResponseDTO update(Integer id, RecipeRequestDTO dto) {
        return mapToDTO(service.update(id, dto));
    }

    public void delete(Integer id) {
        service.delete(id);
    }

    private RecipeResponseDTO mapToDTO(RecipeModel r) {
        List<RecipeIngredientModel> ings = ingredienteRepository.findByReceitaId(r.getId());

        List<IngredienteResponseDTO> ingredientesDTO = ings.stream()
                .map(ing -> {
                    String nome;
                    String origem;
                    if (ing.getAlimento() != null) {
                        nome   = ing.getAlimento().getNome();
                        origem = "ibge_taco";
                    } else {
                        nome   = ing.getAlimentoCustom().getNome();
                        origem = "custom";
                    }
                    return new IngredienteResponseDTO(
                            ing.getId(), nome, origem, ing.getQuantidadeG(), ing.getUnidade()
                    );
                })
                .toList();

        MacrosReceita macros = service.calcularMacros(r.getId());

        return new RecipeResponseDTO(
                r.getId(), r.getNome(), r.getModoPreparo(), r.getPorcaoG(), r.getRendimentoG(),
                ingredientesDTO,
                new MacrosTotaisDTO(
                        macros.kcalTotal(), macros.proteinaTotal(), macros.carboidratoTotal(),
                        macros.gorduraTotal(), macros.fibraTotal(), macros.sodioTotal()
                ),
                new MacrosPorcaoDTO(
                        macros.kcalPorcao(), macros.proteinaPorcao(), macros.carboidratoPorcao(),
                        macros.gorduraPorcao(), macros.fibraPorcao(), macros.sodioPorcao()
                )
        );
    }
}