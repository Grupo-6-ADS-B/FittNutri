package fitt_nutri.example.demo.service;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Function;

/**
 * Gera o PDF do plano alimentar do paciente. É o único gerador de PDF da dieta: tanto o botão
 * "imprimir" quanto o envio para a nuvem (fila RabbitMQ + S3) passam por aqui.
 *
 * O serviço não acessa banco nem segurança: recebe os dados prontos (ver {@link Dados}), o que o
 * deixa fácil de testar. Os valores nutricionais vêm de uma função, porque o cálculo mora no MealService.
 * Quando um item não tem valor nutricional, o PDF mostra "—" em vez de um zero que enganaria.
 */
@Component
public class DietPdfService {

    private static final Locale PT_BR = Locale.of("pt", "BR");
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String SEM_VALOR = "—";

    // Mesma paleta do PDF de bioimpedância
    private static final Color VERDE = new Color(46, 125, 50);
    private static final Color VERDE_CLARO = new Color(232, 245, 233);
    private static final Color CINZA_TEXTO = new Color(97, 97, 97);
    private static final Color CINZA_CLARO = new Color(245, 245, 245);
    private static final Color LINHA = new Color(224, 224, 224);
    private static final Color TEXTO = new Color(33, 33, 33);

    private static final Font F_TITULO = new Font(Font.HELVETICA, 22, Font.BOLD, Color.WHITE);
    private static final Font F_SUBTITULO = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(220, 237, 221));
    private static final Font F_ROTULO = new Font(Font.HELVETICA, 8, Font.BOLD, CINZA_TEXTO);
    private static final Font F_VALOR = new Font(Font.HELVETICA, 10, Font.NORMAL, TEXTO);
    private static final Font F_SECAO = new Font(Font.HELVETICA, 11, Font.BOLD, VERDE);
    private static final Font F_REFEICAO = new Font(Font.HELVETICA, 12, Font.BOLD, TEXTO);
    private static final Font F_REFEICAO_KCAL = new Font(Font.HELVETICA, 11, Font.BOLD, VERDE);
    private static final Font F_COLUNA = new Font(Font.HELVETICA, 8, Font.BOLD, CINZA_TEXTO);
    private static final Font F_ITEM = new Font(Font.HELVETICA, 10, Font.NORMAL, TEXTO);
    private static final Font F_MACRO_ROTULO = new Font(Font.HELVETICA, 9, Font.BOLD, CINZA_TEXTO);
    private static final Font F_MACRO_VALOR = new Font(Font.HELVETICA, 9, Font.NORMAL, TEXTO);
    private static final Font F_OBS = new Font(Font.HELVETICA, 9, Font.ITALIC, CINZA_TEXTO);
    private static final Font F_RESUMO_NUMERO = new Font(Font.HELVETICA, 15, Font.BOLD, VERDE);
    private static final Font F_RESUMO_ROTULO = new Font(Font.HELVETICA, 8, Font.NORMAL, CINZA_TEXTO);
    private static final Font F_AVISO = new Font(Font.HELVETICA, 8, Font.ITALIC, CINZA_TEXTO);

    /** Tudo o que o PDF precisa, já carregado. */
    public record Dados(
            String pacienteNome,
            String nutricionistaNome,
            String nutricionistaCrn,
            LocalDate dataConsulta,
            String motivoConsulta,
            LocalDate emitidoEm,
            List<MealModel> refeicoes,
            Function<MealItemModel, Optional<MacrosDTO>> macrosDoItem) {
    }

    public byte[] gerar(Dados dados) {
        try (ByteArrayOutputStream saida = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 60);
            PdfWriter writer = PdfWriter.getInstance(doc, saida);
            writer.setPageEvent(new Rodape(dados.pacienteNome()));
            doc.open();

            doc.add(cabecalho());
            doc.add(informacoes(dados));

            List<MealModel> refeicoes = ordenar(dados.refeicoes());
            if (refeicoes.isEmpty()) {
                Paragraph vazio = new Paragraph("Nenhuma refeição cadastrada para este paciente.", F_VALOR);
                vazio.setSpacingBefore(18f);
                doc.add(vazio);
            } else {
                doc.add(resumoDoDia(refeicoes, dados));
                for (MealModel refeicao : refeicoes) {
                    doc.add(blocoRefeicao(refeicao, dados));
                }
            }

            Paragraph aviso = new Paragraph(
                    "Valores nutricionais estimados com base nas tabelas TACO e IBGE. "
                            + "Este plano não substitui o acompanhamento com a nutricionista.", F_AVISO);
            aviso.setSpacingBefore(8f);
            doc.add(aviso);

            doc.close();
            return saida.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new IllegalStateException("Falha ao gerar o PDF do plano alimentar", e);
        }
    }

    // ------------------------------------------------------------------ blocos do documento

    private PdfPTable cabecalho() throws DocumentException {
        PdfPTable tabela = tabela(1);
        PdfPCell celula = new PdfPCell();
        celula.setBackgroundColor(VERDE);
        celula.setBorder(Rectangle.NO_BORDER);
        celula.setPadding(16f);
        celula.addElement(new Paragraph("PLANO ALIMENTAR", F_TITULO));
        celula.addElement(new Paragraph("FittNutri  ·  Acompanhamento nutricional", F_SUBTITULO));
        tabela.addCell(celula);
        tabela.setSpacingAfter(10f);
        return tabela;
    }

    private PdfPTable informacoes(Dados d) throws DocumentException {
        PdfPTable tabela = tabela(4);
        tabela.setWidths(new float[]{1.2f, 2.8f, 1.2f, 1.8f});

        String nutri = texto(d.nutricionistaNome());
        if (!nutri.isEmpty() && !texto(d.nutricionistaCrn()).isEmpty()) {
            nutri += "  (CRN " + d.nutricionistaCrn().trim() + ")";
        }
        String consulta = d.dataConsulta() != null ? d.dataConsulta().format(DATA) : SEM_VALOR;
        String emitido = (d.emitidoEm() != null ? d.emitidoEm() : LocalDate.now()).format(DATA);

        linhaInfo(tabela, "PACIENTE", valorOuTraco(d.pacienteNome()), "CONSULTA", consulta);
        linhaInfo(tabela, "NUTRICIONISTA", valorOuTraco(nutri), "EMITIDO EM", emitido);

        PdfPCell rotulo = celulaInfo("MOTIVO DA CONSULTA", F_ROTULO);
        PdfPCell valor = celulaInfo(valorOuTraco(d.motivoConsulta()), F_VALOR);
        valor.setColspan(3);
        tabela.addCell(rotulo);
        tabela.addCell(valor);
        return tabela;
    }

    private PdfPTable resumoDoDia(List<MealModel> refeicoes, Dados d) throws DocumentException {
        Totais total = new Totais();
        for (MealModel refeicao : refeicoes) {
            for (MealItemModel item : itens(refeicao)) {
                d.macrosDoItem().apply(item).ifPresent(total::somar);
            }
        }

        PdfPTable externa = tabela(1);
        externa.setSpacingBefore(14f);
        externa.setSpacingAfter(4f);
        externa.setKeepTogether(true);
        PdfPCell titulo = new PdfPCell(new Phrase("Resumo do dia", F_SECAO));
        titulo.setBorder(Rectangle.NO_BORDER);
        titulo.setPaddingBottom(5f);
        externa.addCell(titulo);

        PdfPTable caixas = tabela(5);
        caixas.addCell(caixaResumo(total.vazio ? SEM_VALOR : num(total.kcal), "kcal"));
        caixas.addCell(caixaResumo(total.vazio ? SEM_VALOR : num(total.proteina) + " g", "proteínas"));
        caixas.addCell(caixaResumo(total.vazio ? SEM_VALOR : num(total.carboidrato) + " g", "carboidratos"));
        caixas.addCell(caixaResumo(total.vazio ? SEM_VALOR : num(total.gordura) + " g", "gorduras"));
        caixas.addCell(caixaResumo(total.vazio ? SEM_VALOR : num(total.fibra) + " g", "fibras"));
        PdfPCell envoltorio = new PdfPCell(caixas);
        envoltorio.setBorder(Rectangle.NO_BORDER);
        envoltorio.setPadding(0f);
        externa.addCell(envoltorio);
        return externa;
    }

    private PdfPTable blocoRefeicao(MealModel refeicao, Dados d) throws DocumentException {
        List<MealItemModel> itens = itens(refeicao);
        Totais total = new Totais();

        PdfPTable tabela = tabela(3);
        tabela.setWidths(new float[]{5f, 2.2f, 1.4f});
        tabela.setKeepTogether(true);
        tabela.setSpacingBefore(12f);

        // Faixa com horário + nome da refeição e o total de kcal
        String horario = texto(refeicao.getHorario());
        Phrase titulo = new Phrase();
        if (!horario.isEmpty()) {
            titulo.add(new Chunk(horario + "   ", F_REFEICAO_KCAL));
        }
        titulo.add(new Chunk(valorOuTraco(refeicao.getDescricao()), F_REFEICAO));
        PdfPCell faixa = new PdfPCell(titulo);
        faixa.setColspan(2);
        faixa.setBackgroundColor(VERDE_CLARO);
        faixa.setBorder(Rectangle.NO_BORDER);
        faixa.setPadding(8f);
        tabela.addCell(faixa);

        // Cabeçalho das colunas e itens (o total da faixa é calculado junto)
        List<PdfPCell> linhas = new java.util.ArrayList<>();
        linhas.add(celulaColuna("ALIMENTO", Element.ALIGN_LEFT));
        linhas.add(celulaColuna("QUANTIDADE", Element.ALIGN_LEFT));
        linhas.add(celulaColuna("KCAL", Element.ALIGN_RIGHT));
        for (MealItemModel item : itens) {
            Optional<MacrosDTO> macros = d.macrosDoItem().apply(item);
            macros.ifPresent(total::somar);
            linhas.add(celulaItem(valorOuTraco(item.getAlimento()), Element.ALIGN_LEFT));
            linhas.add(celulaItem(quantidade(item), Element.ALIGN_LEFT));
            linhas.add(celulaItem(macros.map(m -> num(m.kcal())).orElse(SEM_VALOR), Element.ALIGN_RIGHT));
        }

        PdfPCell kcalFaixa = new PdfPCell(new Phrase(total.vazio ? SEM_VALOR : num(total.kcal) + " kcal", F_REFEICAO_KCAL));
        kcalFaixa.setBackgroundColor(VERDE_CLARO);
        kcalFaixa.setBorder(Rectangle.NO_BORDER);
        kcalFaixa.setHorizontalAlignment(Element.ALIGN_RIGHT);
        kcalFaixa.setPadding(8f);
        tabela.addCell(kcalFaixa);
        linhas.forEach(tabela::addCell);

        // Macros da refeição
        PdfPCell macros = new PdfPCell(linhaMacros(total));
        macros.setColspan(3);
        macros.setBackgroundColor(CINZA_CLARO);
        macros.setBorder(Rectangle.NO_BORDER);
        macros.setPadding(7f);
        tabela.addCell(macros);

        // Observação da refeição
        if (!texto(refeicao.getObservacao()).isEmpty()) {
            PdfPCell obs = new PdfPCell(new Phrase("Observação: " + refeicao.getObservacao().trim(), F_OBS));
            obs.setColspan(3);
            obs.setBorder(Rectangle.LEFT);
            obs.setBorderColor(VERDE);
            obs.setBorderWidthLeft(2f);
            obs.setPaddingLeft(8f);
            obs.setPaddingTop(6f);
            obs.setPaddingBottom(6f);
            tabela.addCell(obs);
        }
        return tabela;
    }

    private Phrase linhaMacros(Totais t) {
        Phrase frase = new Phrase();
        String[][] pares = {
                {"Proteínas ", t.vazio ? SEM_VALOR : num(t.proteina) + " g"},
                {"Carboidratos ", t.vazio ? SEM_VALOR : num(t.carboidrato) + " g"},
                {"Gorduras ", t.vazio ? SEM_VALOR : num(t.gordura) + " g"},
                {"Fibras ", t.vazio ? SEM_VALOR : num(t.fibra) + " g"}};
        for (int i = 0; i < pares.length; i++) {
            frase.add(new Chunk(pares[i][0], F_MACRO_ROTULO));
            frase.add(new Chunk(pares[i][1] + (i < pares.length - 1 ? "     " : ""), F_MACRO_VALOR));
        }
        return frase;
    }

    // ------------------------------------------------------------------ células e utilitários

    private PdfPTable tabela(int colunas) {
        PdfPTable t = new PdfPTable(colunas);
        t.setWidthPercentage(100);
        return t;
    }

    private void linhaInfo(PdfPTable t, String rotulo1, String valor1, String rotulo2, String valor2) {
        t.addCell(celulaInfo(rotulo1, F_ROTULO));
        t.addCell(celulaInfo(valor1, F_VALOR));
        t.addCell(celulaInfo(rotulo2, F_ROTULO));
        t.addCell(celulaInfo(valor2, F_VALOR));
    }

    private PdfPCell celulaInfo(String texto, Font fonte) {
        PdfPCell c = new PdfPCell(new Phrase(texto, fonte));
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(LINHA);
        c.setBorderWidth(0.6f);
        c.setPaddingTop(6f);
        c.setPaddingBottom(6f);
        c.setPaddingLeft(2f);
        return c;
    }

    private PdfPCell caixaResumo(String valor, String rotulo) {
        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(VERDE_CLARO);
        c.setBorder(Rectangle.LEFT | Rectangle.RIGHT);
        c.setBorderColor(Color.WHITE);
        c.setBorderWidth(3f);
        c.setPadding(8f);
        Paragraph numero = new Paragraph(valor, F_RESUMO_NUMERO);
        numero.setAlignment(Element.ALIGN_CENTER);
        Paragraph legenda = new Paragraph(rotulo, F_RESUMO_ROTULO);
        legenda.setAlignment(Element.ALIGN_CENTER);
        c.addElement(numero);
        c.addElement(legenda);
        return c;
    }

    private PdfPCell celulaColuna(String texto, int alinhamento) {
        PdfPCell c = new PdfPCell(new Phrase(texto, F_COLUNA));
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(LINHA);
        c.setBorderWidth(0.6f);
        c.setHorizontalAlignment(alinhamento);
        c.setPaddingTop(6f);
        c.setPaddingBottom(4f);
        c.setPaddingLeft(alinhamento == Element.ALIGN_LEFT ? 8f : 2f);
        c.setPaddingRight(alinhamento == Element.ALIGN_RIGHT ? 8f : 2f);
        return c;
    }

    private PdfPCell celulaItem(String texto, int alinhamento) {
        PdfPCell c = new PdfPCell(new Phrase(texto, F_ITEM));
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(LINHA);
        c.setBorderWidth(0.4f);
        c.setHorizontalAlignment(alinhamento);
        c.setPaddingTop(5f);
        c.setPaddingBottom(5f);
        c.setPaddingLeft(alinhamento == Element.ALIGN_LEFT ? 8f : 2f);
        c.setPaddingRight(alinhamento == Element.ALIGN_RIGHT ? 8f : 2f);
        return c;
    }

    private List<MealModel> ordenar(List<MealModel> refeicoes) {
        if (refeicoes == null) {
            return List.of();
        }
        return refeicoes.stream()
                .sorted(Comparator.comparing(MealModel::getHorario, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private List<MealItemModel> itens(MealModel refeicao) {
        return refeicao.getAlimentos() != null ? refeicao.getAlimentos() : List.of();
    }

    private String quantidade(MealItemModel item) {
        if (item.getQuantidade() == null) {
            return SEM_VALOR;
        }
        BigDecimal q = BigDecimal.valueOf(item.getQuantidade()).setScale(2, RoundingMode.HALF_UP).stripTrailingZeros();
        String numero = q.scale() <= 0 ? q.toBigInteger().toString() : q.toPlainString().replace('.', ',');
        return (numero + " " + texto(item.getUnidade())).trim();
    }

    private static String num(double valor) {
        return String.format(PT_BR, "%.1f", valor);
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private static String valorOuTraco(String valor) {
        String t = texto(valor);
        return t.isEmpty() ? SEM_VALOR : t;
    }

    /** Soma de macros; "vazio" continua true enquanto nenhum item tem valor (aí o PDF mostra "—"). */
    private static class Totais {
        boolean vazio = true;
        double kcal;
        double proteina;
        double carboidrato;
        double gordura;
        double fibra;

        void somar(MacrosDTO m) {
            vazio = false;
            kcal += m.kcal();
            proteina += m.proteina();
            carboidrato += m.carboidrato();
            gordura += m.lipideos();
            fibra += m.fibra();
        }
    }

    /** Rodapé de todas as páginas: nome do paciente à esquerda e "Página X de Y" à direita. */
    private static class Rodape extends PdfPageEventHelper {
        private final String paciente;
        private PdfTemplate totalPaginas;
        private BaseFont fonte;

        Rodape(String paciente) {
            this.paciente = paciente == null ? "" : paciente.trim();
        }

        @Override
        public void onOpenDocument(PdfWriter writer, Document document) {
            try {
                fonte = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
                totalPaginas = writer.getDirectContent().createTemplate(24, 12);
            } catch (DocumentException | IOException e) {
                throw new IllegalStateException("Falha ao preparar o rodapé do PDF", e);
            }
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            cb.saveState();
            cb.setColorStroke(LINHA);
            cb.setLineWidth(0.6f);
            cb.moveTo(document.left(), 46);
            cb.lineTo(document.right(), 46);
            cb.stroke();

            String esquerda = "FittNutri  ·  Plano alimentar" + (paciente.isEmpty() ? "" : " de " + limitar(paciente, 55));
            cb.beginText();
            cb.setFontAndSize(fonte, 8);
            cb.setColorFill(CINZA_TEXTO);
            cb.setTextMatrix(document.left(), 34);
            cb.showText(esquerda);
            cb.endText();

            String pagina = "Página " + writer.getPageNumber() + " de ";
            float largura = fonte.getWidthPoint(pagina, 8);
            float x = document.right() - largura - 14;
            cb.beginText();
            cb.setFontAndSize(fonte, 8);
            cb.setColorFill(CINZA_TEXTO);
            cb.setTextMatrix(x, 34);
            cb.showText(pagina);
            cb.endText();
            cb.addTemplate(totalPaginas, x + largura, 34);
            cb.restoreState();
        }

        @Override
        public void onCloseDocument(PdfWriter writer, Document document) {
            totalPaginas.beginText();
            totalPaginas.setFontAndSize(fonte, 8);
            totalPaginas.setColorFill(CINZA_TEXTO);
            totalPaginas.setTextMatrix(0, 0);
            totalPaginas.showText(String.valueOf(writer.getPageNumber() - 1));
            totalPaginas.endText();
        }

        private static String limitar(String texto, int max) {
            return texto.length() <= max ? texto : texto.substring(0, max - 1) + "…";
        }
    }
}
