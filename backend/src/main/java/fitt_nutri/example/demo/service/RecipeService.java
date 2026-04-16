package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.RecipeIngredientRequestDTO;
import fitt_nutri.example.demo.dto.request.RecipeRequestDTO;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.model.CustomFoodModel;
import fitt_nutri.example.demo.model.CustomFoodModel.TipoMacro;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.RecipeIngredientModel;
import fitt_nutri.example.demo.model.RecipeModel;
import fitt_nutri.example.demo.repository.CustomFoodRepository;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.RecipeIngredientRepository;
import fitt_nutri.example.demo.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository ingredienteRepository;
    private final FoodItensRepository foodItensRepository;
    private final CustomFoodRepository customFoodRepository;

    public Page<RecipeModel> findAll(Pageable pageable) {
        return recipeRepository.findAll(pageable);
    }

    public Page<RecipeModel> findByNome(String nome, Pageable pageable) {
        return recipeRepository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    public RecipeModel findById(Integer id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receita não encontrada: " + id));
    }

    @Transactional
    public RecipeModel create(RecipeRequestDTO dto) {
        RecipeModel receita = new RecipeModel();
        receita.setNome(dto.nome());
        receita.setModoPreparo(dto.modoPreparo());
        receita.setPorcaoG(dto.porcaoG());
        receita.setRendimentoG(dto.rendimentoG());
        recipeRepository.save(receita);
        salvarIngredientes(receita, dto.ingredientes());
        return receita;
    }

    @Transactional
    public RecipeModel update(Integer id, RecipeRequestDTO dto) {
        RecipeModel receita = findById(id);
        receita.setNome(dto.nome());
        receita.setModoPreparo(dto.modoPreparo());
        receita.setPorcaoG(dto.porcaoG());
        receita.setRendimentoG(dto.rendimentoG());
        ingredienteRepository.deleteAll(ingredienteRepository.findByReceitaId(id));
        salvarIngredientes(receita, dto.ingredientes());
        return recipeRepository.save(receita);
    }

    @Transactional
    public void delete(Integer id) {
        recipeRepository.delete(findById(id));
    }

    public MacrosReceita calcularMacros(Integer receitaId) {
        RecipeModel receita = findById(receitaId);
        List<RecipeIngredientModel> ingredientes = ingredienteRepository.findByReceitaId(receitaId);

        double kcal = 0, ptn = 0, cho = 0, fat = 0, fib = 0, sodio = 0;

        for (RecipeIngredientModel ing : ingredientes) {
            double qtd = ing.getQuantidadeG();

            if (ing.getAlimento() != null) {
                FoodItensModel a = ing.getAlimento();
                kcal  += safe(a.getEnergiaKcal()) * qtd;
                ptn   += safe(a.getProteina())    * qtd;
                cho   += safe(a.getCarboidrato())  * qtd;
                fat   += safe(a.getLipideos())     * qtd;
                fib   += safe(a.getFibra())        * qtd;
                sodio += safe(a.getSodio())        * qtd;

            } else if (ing.getAlimentoCustom() != null) {
                CustomFoodModel cf = ing.getAlimentoCustom();

                if (cf.getTipoMacro() == TipoMacro.por_100g) {
                    kcal  += safe(cf.getEnergiaKcal()) * qtd;
                    ptn   += safe(cf.getProteina())    * qtd;
                    cho   += safe(cf.getCarboidrato())  * qtd;
                    fat   += safe(cf.getLipideos())     * qtd;
                    fib   += safe(cf.getFibra())        * qtd;
                    sodio += safe(cf.getSodio())        * qtd;

                } else if (cf.getTipoMacro() == TipoMacro.total && cf.getPorcaoG() != null && cf.getPorcaoG() > 0) {
                    double fator = qtd / cf.getPorcaoG();
                    kcal  += safe(cf.getEnergiaKcal()) * fator;
                    ptn   += safe(cf.getProteina())    * fator;
                    cho   += safe(cf.getCarboidrato())  * fator;
                    fat   += safe(cf.getLipideos())     * fator;
                    fib   += safe(cf.getFibra())        * fator;
                    sodio += safe(cf.getSodio())        * fator;
                }
            }
        }

        Double porcao     = receita.getPorcaoG();
        Double rendimento = receita.getRendimentoG();
        double fatorPorcao = (porcao != null && rendimento != null && rendimento > 0)
                ? porcao / rendimento : 1.0;

        return new MacrosReceita(
                round(kcal),  round(ptn),  round(cho),  round(fat),  round(fib),  round(sodio),
                round(kcal * fatorPorcao), round(ptn * fatorPorcao), round(cho * fatorPorcao),
                round(fat  * fatorPorcao), round(fib * fatorPorcao), round(sodio * fatorPorcao)
        );
    }

    private void salvarIngredientes(RecipeModel receita, List<RecipeIngredientRequestDTO> dtos) {
        for (RecipeIngredientRequestDTO dto : dtos) {
            validarOrigem(dto);
            RecipeIngredientModel ing = new RecipeIngredientModel();
            ing.setReceita(receita);
            ing.setQuantidadeG(dto.quantidadeG());
            ing.setUnidade(dto.unidade());

            if (dto.alimentoId() != null) {
                ing.setAlimento(foodItensRepository.findById(dto.alimentoId())
                        .orElseThrow(() -> new RuntimeException("Alimento não encontrado: " + dto.alimentoId())));
            } else {
                ing.setAlimentoCustom(customFoodRepository.findById(dto.alimentoCustomId())
                        .orElseThrow(() -> new RuntimeException("Alimento customizado não encontrado: " + dto.alimentoCustomId())));
            }

            ingredienteRepository.save(ing);
        }
    }

    private void validarOrigem(RecipeIngredientRequestDTO dto) {
        boolean temAlimento = dto.alimentoId() != null;
        boolean temCustom   = dto.alimentoCustomId() != null;
        if (temAlimento == temCustom) {
            throw new InvalidDataException("Cada ingrediente deve ter exatamente um de: alimentoId ou alimentoCustomId");
        }
    }

    private double safe(Double v)  { return v != null ? v : 0.0; }
    private double round(double v) { return Math.round(v * 100.0) / 100.0; }

    public record MacrosReceita(
            double kcalTotal,    double proteinaTotal,    double carboidratoTotal,
            double gorduraTotal, double fibraTotal,       double sodioTotal,
            double kcalPorcao,   double proteinaPorcao,   double carboidratoPorcao,
            double gorduraPorcao, double fibraPorcao,     double sodioPorcao
    ) {}
}