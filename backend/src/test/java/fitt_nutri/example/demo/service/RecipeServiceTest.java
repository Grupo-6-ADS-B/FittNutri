package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.model.CustomFoodModel;
import fitt_nutri.example.demo.model.CustomFoodModel.TipoMacro;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.RecipeIngredientModel;
import fitt_nutri.example.demo.model.RecipeModel;
import fitt_nutri.example.demo.repository.CustomFoodRepository;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.RecipeIngredientRepository;
import fitt_nutri.example.demo.repository.RecipeRepository;
import fitt_nutri.example.demo.service.RecipeService.MacrosReceita;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    private static final int RECEITA_ID = 1;

    @InjectMocks
    private RecipeService service;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private RecipeIngredientRepository ingredienteRepository;

    @Mock
    private FoodItensRepository foodItensRepository;

    @Mock
    private CustomFoodRepository customFoodRepository;

    private RecipeModel receita(Double porcaoG, Double rendimentoG) {
        RecipeModel receita = new RecipeModel();
        receita.setId(RECEITA_ID);
        receita.setPorcaoG(porcaoG);
        receita.setRendimentoG(rendimentoG);
        return receita;
    }

    private RecipeIngredientModel ingrediente(FoodItensModel alimento, CustomFoodModel custom, double gramas) {
        RecipeIngredientModel ing = new RecipeIngredientModel();
        ing.setAlimento(alimento);
        ing.setAlimentoCustom(custom);
        ing.setQuantidadeG(gramas);
        return ing;
    }

    private CustomFoodModel custom(TipoMacro tipo, Double porcaoG, double kcal, double proteina) {
        CustomFoodModel cf = new CustomFoodModel();
        cf.setTipoMacro(tipo);
        cf.setPorcaoG(porcaoG);
        cf.setEnergiaKcal(kcal);
        cf.setProteina(proteina);
        return cf;
    }

    private MacrosReceita calcular(RecipeModel receita, RecipeIngredientModel... ingredientes) {
        when(recipeRepository.findById(RECEITA_ID)).thenReturn(Optional.of(receita));
        when(ingredienteRepository.findByReceitaId(RECEITA_ID)).thenReturn(List.of(ingredientes));
        return service.calcularMacros(RECEITA_ID);
    }

    @Test
    @DisplayName("Alimento TACO/IBGE: valores no banco são por 1 g -> valor x gramas")
    void calcularMacros_alimentoTaco_usaValorPorGrama() {
        FoodItensModel arroz = new FoodItensModel();
        arroz.setEnergiaKcal(1.2353);  // 123,53 kcal/100 g já dividido por 100 (data.sql)
        arroz.setProteina(0.0259);

        MacrosReceita macros = calcular(receita(null, null), ingrediente(arroz, null, 60));

        assertEquals(74.12, macros.kcalTotal());
        assertEquals(1.55, macros.proteinaTotal());
    }

    @Test
    @DisplayName("Custom por_100g: valores do rótulo para 100 g -> valor x gramas / 100")
    void calcularMacros_customPor100g_dividePor100() {
        CustomFoodModel tapioca = custom(TipoMacro.por_100g, null, 350, 0.2);

        MacrosReceita macros = calcular(receita(null, null), ingrediente(null, tapioca, 50));

        assertEquals(175.0, macros.kcalTotal());
        assertEquals(0.1, macros.proteinaTotal());
    }

    @Test
    @DisplayName("Custom total: valores da porção -> valor x gramas / porcaoG")
    void calcularMacros_customTotal_usaPorcao() {
        CustomFoodModel pastaAmendoim = custom(TipoMacro.total, 30.0, 110, 3);

        MacrosReceita macros = calcular(receita(null, null), ingrediente(null, pastaAmendoim, 15));

        assertEquals(55.0, macros.kcalTotal());
        assertEquals(1.5, macros.proteinaTotal());
    }

    @Test
    @DisplayName("Custom total sem porção é ignorado no cálculo")
    void calcularMacros_customTotalSemPorcao_ignora() {
        CustomFoodModel semPorcao = custom(TipoMacro.total, null, 110, 3);

        MacrosReceita macros = calcular(receita(null, null), ingrediente(null, semPorcao, 15));

        assertEquals(0.0, macros.kcalTotal());
    }

    @Test
    @DisplayName("Receita com os três tipos soma tudo e aplica porção / rendimento")
    void calcularMacros_receitaMista_somaEAplicaPorcao() {
        FoodItensModel ovo = new FoodItensModel();
        ovo.setEnergiaKcal(1.46);  // 146 kcal/100 g, por 1 g
        CustomFoodModel tapioca = custom(TipoMacro.por_100g, null, 350, 0);
        CustomFoodModel pastaAmendoim = custom(TipoMacro.total, 30.0, 110, 0);

        // Receita rende 200 g, porção de 100 g -> metade do total por porção
        MacrosReceita macros = calcular(receita(100.0, 200.0),
                ingrediente(ovo, null, 50),            // 73 kcal
                ingrediente(null, tapioca, 50),        // 175 kcal
                ingrediente(null, pastaAmendoim, 30)); // 110 kcal

        assertEquals(358.0, macros.kcalTotal());
        assertEquals(179.0, macros.kcalPorcao());
    }
}
