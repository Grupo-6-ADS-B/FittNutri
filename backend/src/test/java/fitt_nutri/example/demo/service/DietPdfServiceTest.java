package fitt_nutri.example.demo.service;

import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("DietPdfService — PDF do plano alimentar")
class DietPdfServiceTest {

    private final DietPdfService service = new DietPdfService();

    private static MealItemModel item(String alimento, Double quantidade, String unidade) {
        MealItemModel i = new MealItemModel();
        i.setAlimento(alimento);
        i.setQuantidade(quantidade);
        i.setUnidade(unidade);
        return i;
    }

    private static MealModel refeicao(String horario, String descricao, String observacao, MealItemModel... itens) {
        MealModel m = new MealModel();
        m.setHorario(horario);
        m.setDescricao(descricao);
        m.setObservacao(observacao);
        m.setAlimentos(new ArrayList<>(List.of(itens)));
        return m;
    }

    /** Macros fixos por nome de alimento; "Sem valor" devolve vazio, como quando o alimento não está na base. */
    private static final Function<MealItemModel, Optional<MacrosDTO>> MACROS = i -> switch (String.valueOf(i.getAlimento())) {
        case "Arroz, integral, cozido" -> Optional.of(new MacrosDTO(2.6, 25.8, 1.0, 2.7, 123.5));
        case "Ovo, cozido" -> Optional.of(new MacrosDTO(11.3, 1.0, 9.5, 0.0, 139.5));
        default -> Optional.empty();
    };

    private DietPdfService.Dados dados(List<MealModel> refeicoes) {
        return new DietPdfService.Dados("Maria da Silva", "Dra. Jane Gonzalez", "12345/SP",
                LocalDate.of(2026, 10, 20), "Emagrecimento", LocalDate.of(2026, 10, 25), refeicoes, MACROS);
    }

    private String textoDaPagina(byte[] pdf, int pagina) throws IOException {
        PdfReader leitor = new PdfReader(pdf);
        try {
            return new PdfTextExtractor(leitor).getTextFromPage(pagina);
        } finally {
            leitor.close();
        }
    }

    private int paginas(byte[] pdf) throws IOException {
        PdfReader leitor = new PdfReader(pdf);
        try {
            return leitor.getNumberOfPages();
        } finally {
            leitor.close();
        }
    }

    @Test
    @DisplayName("gera um PDF válido com cabeçalho, dados do paciente e da nutricionista")
    void geraCabecalhoEDados() throws IOException {
        byte[] pdf = service.gerar(dados(List.of(
                refeicao("12:00", "Almoço", null, item("Arroz, integral, cozido", 100.0, "g")))));

        assertTrue(new String(pdf, 0, 5).startsWith("%PDF-"));
        String texto = textoDaPagina(pdf, 1);
        assertTrue(texto.contains("PLANO ALIMENTAR"));
        assertTrue(texto.contains("Maria da Silva"));
        assertTrue(texto.contains("Dra. Jane Gonzalez"));
        assertTrue(texto.contains("CRN 12345/SP"));
        assertTrue(texto.contains("20/10/2026"), "data da consulta");
        assertTrue(texto.contains("25/10/2026"), "data de emissão");
        assertTrue(texto.contains("Emagrecimento"));
    }

    @Test
    @DisplayName("mostra os números em português (vírgula) e o resumo do dia")
    void mostraValoresEResumo() throws IOException {
        byte[] pdf = service.gerar(dados(List.of(
                refeicao("08:00", "Café da manhã", null, item("Ovo, cozido", 50.0, "g")),
                refeicao("12:00", "Almoço", null, item("Arroz, integral, cozido", 100.0, "g")))));

        String texto = textoDaPagina(pdf, 1);
        assertTrue(texto.contains("Resumo do dia"));
        assertTrue(texto.contains("123,5"), "kcal do arroz");
        assertTrue(texto.contains("139,5"), "kcal do ovo");
        assertTrue(texto.contains("263,0"), "total do dia = 123,5 + 139,5");
        assertTrue(texto.contains("100 g"), "quantidade sem casas desnecessárias");
        assertTrue(!texto.contains("123.5"), "não pode sair com ponto decimal");
    }

    @Test
    @DisplayName("item sem valor nutricional aparece com traço, e não com zero")
    void itemSemValorMostraTraco() throws IOException {
        byte[] pdf = service.gerar(dados(List.of(
                refeicao("08:00", "Café", null, item("Alimento sem dados", 1.0, "unidade")))));

        String texto = textoDaPagina(pdf, 1);
        assertTrue(texto.contains("—"));
        assertTrue(!texto.contains("0,0"), "não deve inventar zero");
    }

    @Test
    @DisplayName("ordena as refeições por horário e mostra a observação")
    void ordenaPorHorarioEMostraObservacao() throws IOException {
        byte[] pdf = service.gerar(dados(List.of(
                refeicao("19:30", "Jantar", "Sem sal", item("Ovo, cozido", 50.0, "g")),
                refeicao("07:30", "Café da manhã", null, item("Ovo, cozido", 50.0, "g")))));

        String texto = textoDaPagina(pdf, 1);
        assertTrue(texto.indexOf("Café da manhã") < texto.indexOf("Jantar"));
        assertTrue(texto.contains("Observação: Sem sal"));
    }

    @Test
    @DisplayName("quantidade fracionada usa vírgula e a unidade informada")
    void formataQuantidade() throws IOException {
        byte[] pdf = service.gerar(dados(List.of(
                refeicao("12:00", "Almoço", null, item("Arroz, integral, cozido", 2.5, "colheres de sopa")))));
        assertTrue(textoDaPagina(pdf, 1).contains("2,5 colheres de sopa"));
    }

    @Test
    @DisplayName("sem refeições, avisa em vez de gerar um PDF em branco")
    void semRefeicoes() throws IOException {
        byte[] pdf = service.gerar(dados(List.of()));
        assertTrue(textoDaPagina(pdf, 1).contains("Nenhuma refeição cadastrada"));
    }

    @Test
    @DisplayName("dados faltando não derrubam o PDF")
    void toleraDadosNulos() throws IOException {
        DietPdfService.Dados d = new DietPdfService.Dados("Paciente", null, null, null, null, null,
                List.of(refeicao(null, null, null, item(null, null, null))), MACROS);
        byte[] pdf = service.gerar(d);
        assertTrue(textoDaPagina(pdf, 1).contains("Paciente"));
    }

    @Test
    @DisplayName("muitas refeições viram várias páginas, com rodapé 'Página X de Y'")
    void rodapeComVariasPaginas() throws IOException {
        List<MealModel> muitas = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            muitas.add(refeicao(String.format("%02d:00", i % 24), "Refeição " + i, null,
                    item("Arroz, integral, cozido", 100.0, "g"), item("Ovo, cozido", 50.0, "g")));
        }
        byte[] pdf = service.gerar(dados(muitas));

        int total = paginas(pdf);
        assertTrue(total >= 2, "esperava mais de uma página");
        assertTrue(textoDaPagina(pdf, 1).contains("Página 1 de " + total));
        assertEquals(true, textoDaPagina(pdf, total).contains("Página " + total + " de " + total));
    }
}
