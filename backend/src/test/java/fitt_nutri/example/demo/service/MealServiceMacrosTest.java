package fitt_nutri.example.demo.service;

import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("MealService — macros por item e geração do PDF")
class MealServiceMacrosTest {

    @Mock private MealRepository repository;
    @Mock private PatientRepository patientRepository;
    @Mock private PatientHistoryRepository patientHistoryRepository;
    @Mock private FoodItensService foodItensService;
    @Mock private FoodItensRepository foodItensRepository;
    @Spy private DietPdfService dietPdfService = new DietPdfService();
    @InjectMocks private MealService service;

    @AfterEach
    void limparSeguranca() {
        SecurityContextHolder.clearContext();
    }

    private static MealItemModel item(String alimento, Double quantidade) {
        MealItemModel i = new MealItemModel();
        i.setAlimento(alimento);
        i.setQuantidade(quantidade);
        i.setUnidade("g");
        return i;
    }

    private static FoodItensModel alimento(String nome, double kcalPorGrama) {
        FoodItensModel f = new FoodItensModel();
        f.setNome(nome);
        f.setEnergiaKcal(kcalPorGrama);
        f.setProteina(0.1);
        f.setCarboidrato(0.2);
        f.setLipideos(0.05);
        f.setFibra(0.01);
        return f;
    }

    @Test
    @DisplayName("usa o snapshot gravado quando existe")
    void usaSnapshot() {
        MealItemModel i = item("Arroz", 100.0);
        i.setSnapshotKcal(123.5);
        i.setSnapshotProteina(2.6);
        i.setSnapshotCarboidrato(25.8);
        i.setSnapshotLipideos(1.0);
        i.setSnapshotFibra(2.7);

        MacrosDTO m = service.macrosDoItem(i).orElseThrow();
        assertEquals(123.5, m.kcal());
        assertEquals(2.6, m.proteina());
    }

    @Test
    @DisplayName("sem snapshot, procura pelo nome e prefere o nome idêntico ao que só contém o texto")
    void prefereNomeExato() {
        when(foodItensRepository.findByNomeContainingIgnoreCase("Arroz")).thenReturn(List.of(
                alimento("Arroz, integral, cozido", 1.2),
                alimento("Arroz", 3.0)));

        MacrosDTO m = service.macrosDoItem(item("Arroz", 10.0)).orElseThrow();
        assertEquals(30.0, m.kcal(), "10 g x 3,0 kcal/g do alimento de nome idêntico");
    }

    @Test
    @DisplayName("sem nome idêntico, usa o primeiro que contém o texto")
    void usaPrimeiroQueContem() {
        when(foodItensRepository.findByNomeContainingIgnoreCase("arroz integral")).thenReturn(List.of(
                alimento("Arroz integral cozido", 1.2)));

        assertEquals(12.0, service.macrosDoItem(item("arroz integral", 10.0)).orElseThrow().kcal());
    }

    @Test
    @DisplayName("alimento que não está na base, quantidade inválida ou nome vazio = sem valor (e não zero)")
    void semValor() {
        when(foodItensRepository.findByNomeContainingIgnoreCase("Ovo, galinha, mexido")).thenReturn(List.of());

        assertTrue(service.macrosDoItem(item("Ovo, galinha, mexido", 2.0)).isEmpty());
        assertTrue(service.macrosDoItem(item("Arroz", null)).isEmpty());
        assertTrue(service.macrosDoItem(item("Arroz", 0.0)).isEmpty());
        assertTrue(service.macrosDoItem(item("  ", 10.0)).isEmpty());
        assertTrue(service.macrosDoItem(item(null, 10.0)).isEmpty());
    }

    @Test
    @DisplayName("alimento sem energia na tabela de origem (ex.: leite integral da TACO) fica sem valor")
    void alimentoSemEnergiaFicaSemValor() {
        FoodItensModel leite = new FoodItensModel();
        leite.setNome("Leite, de vaca, integral");
        when(foodItensRepository.findByNomeContainingIgnoreCase("Leite, de vaca, integral")).thenReturn(List.of(leite));

        assertTrue(service.macrosDoItem(item("Leite, de vaca, integral", 200.0)).isEmpty());
    }

    @Test
    @DisplayName("getMacrosFromMealItem continua devolvendo zeros quando não há valor")
    void metodoAntigoDevolveZeros() {
        MacrosDTO m = service.getMacrosFromMealItem(item("  ", 10.0));
        assertEquals(0.0, m.kcal());
        assertEquals(0.0, m.proteina());
    }

    // ---------------------------------------------------------------- geração do PDF

    private PatientModel pacienteDa(String emailNutri) {
        UserModel nutri = new UserModel();
        nutri.setNome("Dra. Jane");
        nutri.setEmail(emailNutri);
        nutri.setCrn("999/SP");
        PatientModel p = new PatientModel();
        p.setId(7);
        p.setNome("Carlos Souza");
        p.setMotivoConsulta("Ganho de massa muscular");
        p.setNutricionista(nutri);
        return p;
    }

    private void logarComo(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
    }

    @Test
    @DisplayName("generateDietPdf monta o PDF com os dados do paciente e da nutricionista")
    void geraPdfDoPaciente() throws Exception {
        logarComo("jane@fittnutri.com");
        when(patientRepository.findById(7)).thenReturn(Optional.of(pacienteDa("jane@fittnutri.com")));
        MealItemModel i = item("Frango grelhado", 150.0);
        i.setSnapshotKcal(247.5);
        i.setSnapshotProteina(46.0);
        i.setSnapshotCarboidrato(0.0);
        i.setSnapshotLipideos(5.4);
        i.setSnapshotFibra(0.0);
        MealModel refeicao = new MealModel();
        refeicao.setHorario("12:00");
        refeicao.setDescricao("Almoço");
        refeicao.setAlimentos(new ArrayList<>(List.of(i)));
        when(repository.findByPatientId(7)).thenReturn(List.of(refeicao));

        byte[] pdf = service.generateDietPdf(7);

        PdfReader leitor = new PdfReader(pdf);
        String texto = new PdfTextExtractor(leitor).getTextFromPage(1);
        leitor.close();
        assertTrue(texto.contains("Carlos Souza"));
        assertTrue(texto.contains("Dra. Jane"));
        assertTrue(texto.contains("CRN 999/SP"));
        assertTrue(texto.contains("Ganho de massa muscular"));
        assertTrue(texto.contains("247,5"));
        assertTrue(texto.contains("Frango grelhado"));
    }

    @Test
    @DisplayName("generateDietPdf recusa paciente de outra nutricionista")
    void recusaPacienteDeOutraNutri() {
        logarComo("outra@fittnutri.com");
        when(patientRepository.findById(anyInt())).thenReturn(Optional.of(pacienteDa("jane@fittnutri.com")));

        assertThrows(AccessDeniedException.class, () -> service.generateDietPdf(7));
    }
}
