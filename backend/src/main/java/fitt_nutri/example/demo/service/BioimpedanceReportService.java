package fitt_nutri.example.demo.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.*;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BioimpedanceReportService {

    private final PatientRepository patientRepository;
    private final PatientHistoryRepository historyRepository;

    private static final Color PRIMARY = new Color(34, 87, 122);
    private static final Color PRIMARY_LIGHT = new Color(218, 237, 245);
    private static final Color ACCENT_LIGHT = new Color(220, 245, 232);
    private static final Color GRAY_TEXT = new Color(90, 90, 90);
    private static final Color WHITE = new Color(255, 255, 255);
    private static final Color LIGHT_GRAY = new Color(245, 245, 245);
    private static final Color BORDER_COLOR = new Color(200, 200, 200);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private void verificarPropriedadePaciente(PatientModel patient) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (patient.getNutricionista() == null ||
                !emailLogado.equals(patient.getNutricionista().getEmail())) {
            throw new AccessDeniedException(
                    "Acesso negado: este paciente não pertence ao nutricionista logado");
        }
    }

    @Transactional(readOnly = true)
    public byte[] generateBioimpedanceReport(Integer patientId) throws Exception {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        UserModel nutri = patient.getNutricionista();

        List<PatientHistoryModel> historicos =
                historyRepository.findByPatientModelIdOrderByDataConsultaAsc(patientId);

        if (historicos.isEmpty()) {
            throw new NotFoundException("Nenhum dado de avaliação encontrado para este paciente");
        }

        PatientHistoryModel latest = historicos.get(historicos.size() - 1);
        AnthropometricDataModel antropo = latest.getAnthropometricDataModel();
        DataCircleModel circ = latest.getDataCircleModel();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, PRIMARY);
        Font subtitleFont = new Font(Font.HELVETICA, 12, Font.NORMAL, GRAY_TEXT);
        Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, PRIMARY);
        Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(60, 60, 60));
        Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(30, 30, 30));
        Font headerTableFont = new Font(Font.HELVETICA, 9, Font.BOLD, WHITE);
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(40, 40, 40));
        Font refFont = new Font(Font.HELVETICA, 9, Font.NORMAL, GRAY_TEXT);
        Font conclusionFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(40, 40, 40));
        Font nutriFont = new Font(Font.HELVETICA, 10, Font.BOLD, PRIMARY);
        Font nutriDetailFont = new Font(Font.HELVETICA, 9, Font.NORMAL, GRAY_TEXT);

        // === CABEÇALHO ===
        addHeader(doc, titleFont, subtitleFont, patient, nutri, latest.getDataConsulta());

        // === DADOS CALCULADOS ===
        addSection(doc, sectionFont, "Dados Calculados");
        addAnthropometricData(doc, labelFont, valueFont, antropo);

        // === CIRCUNFERÊNCIAS ===
        if (circ != null) {
            addSection(doc, sectionFont, "Circunferências Corporais");
            addCircumferenceData(doc, labelFont, valueFont, circ);
        }

        // === CLASSIFICAÇÕES ===
        addSection(doc, sectionFont, "Classificações");
        addClassifications(doc, labelFont, valueFont, antropo, patient.getSexo());

        // === VALORES DE REFERÊNCIA ===
        addSection(doc, sectionFont, "Valores de Referência");
        addReferenceValues(doc, refFont, patient.getSexo(), antropo.getIdade());

        // === TABELA DE EVOLUÇÃO ===
        if (historicos.size() > 1) {
            addSection(doc, sectionFont, "Evolução do Paciente");
            addEvolutionTable(doc, headerTableFont, cellFont, historicos);
        }

        // === CONCLUSÃO ===
        addSection(doc, sectionFont, "Conclusão");
        addConclusion(doc, conclusionFont, antropo, patient.getSexo());

        // === RODAPÉ - NUTRICIONISTA ===
        doc.add(Chunk.NEWLINE);
        LineSeparator line = new LineSeparator();
        line.setLineColor(BORDER_COLOR);
        doc.add(line);
        doc.add(Chunk.NEWLINE);

        Paragraph nutriName = new Paragraph(nutri.getNome().toUpperCase(), nutriFont);
        nutriName.setAlignment(Element.ALIGN_CENTER);
        doc.add(nutriName);

        Paragraph nutriInfo = new Paragraph("NUTRICIONISTA CLÍNICO(A) — CRN: " + nutri.getCrn(), nutriDetailFont);
        nutriInfo.setAlignment(Element.ALIGN_CENTER);
        doc.add(nutriInfo);

        doc.close();
        return out.toByteArray();
    }

    // =========================================================================
    // Seções do PDF
    // =========================================================================

    private void addHeader(Document doc, Font titleFont, Font subtitleFont,
                           PatientModel patient, UserModel nutri, LocalDate dataAvaliacao) throws DocumentException {

        Paragraph title = new Paragraph("Relatório de Bioimpedância", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(8f);
        doc.add(title);

        LineSeparator line = new LineSeparator();
        line.setLineColor(PRIMARY);
        line.setLineWidth(2f);
        doc.add(line);

        doc.add(Chunk.NEWLINE);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1f, 1f});

        addInfoCell(infoTable, "Nome: " + patient.getNome(), subtitleFont, Element.ALIGN_LEFT);
        addInfoCell(infoTable, "Profissional: " + nutri.getNome(), subtitleFont, Element.ALIGN_RIGHT);

        addInfoCell(infoTable, "Sexo: " + capitalize(patient.getSexo()), subtitleFont, Element.ALIGN_LEFT);
        addInfoCell(infoTable, "CRN: " + nutri.getCrn(), subtitleFont, Element.ALIGN_RIGHT);

        addInfoCell(infoTable, "Data da avaliação: " + dataAvaliacao.format(DATE_FMT), subtitleFont, Element.ALIGN_LEFT);
        addInfoCell(infoTable, "", subtitleFont, Element.ALIGN_RIGHT);

        infoTable.setSpacingAfter(16f);
        doc.add(infoTable);
    }

    private void addAnthropometricData(Document doc, Font labelFont, Font valueFont,
                                        AnthropometricDataModel antropo) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 0.8f, 1.2f, 0.8f});
        table.setSpacingAfter(12f);

        addDataRow(table, labelFont, valueFont, "Altura", format(antropo.getAltura()) + " m");
        addDataRow(table, labelFont, valueFont, "Peso", format(antropo.getPeso()) + " kg");

        addDataRow(table, labelFont, valueFont, "IMC", format(antropo.getImc()) + " kg/m²");
        addDataRow(table, labelFont, valueFont, "Gordura Corporal", format(antropo.getPorcentagemGordura()) + "%");

        addDataRow(table, labelFont, valueFont, "Massa Muscular", format(antropo.getMassaMuscular()) + " kg");
        addDataRow(table, labelFont, valueFont, "Gordura Visceral", format(antropo.getGorduraVisceral()) + "%");

        addDataRow(table, labelFont, valueFont, "Taxa Metab. Basal", format(antropo.getTaxaMetabolicaBasal()) + " kcal");
        addDataRow(table, labelFont, valueFont, "Idade Metabólica",
                antropo.getIdadeMetabolica() != null ? antropo.getIdadeMetabolica() + " anos" : "—");

        doc.add(table);
    }

    private void addCircumferenceData(Document doc, Font labelFont, Font valueFont,
                                       DataCircleModel circ) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 0.8f, 1.2f, 0.8f});
        table.setSpacingAfter(12f);

        addDataRow(table, labelFont, valueFont, "Abdominal", formatCm(circ.getAbdominal()));
        addDataRow(table, labelFont, valueFont, "Cintura", formatCm(circ.getCintura()));

        addDataRow(table, labelFont, valueFont, "Quadril", formatCm(circ.getQuadril()));
        addDataRow(table, labelFont, valueFont, "Braço", formatCm(circ.getBraco()));

        addDataRow(table, labelFont, valueFont, "Coxa", formatCm(circ.getCoxa()));
        addDataRow(table, labelFont, valueFont, "Panturrilha", formatCm(circ.getPanturrilha()));

        addDataRow(table, labelFont, valueFont, "Pulso", formatCm(circ.getPulso()));
        addDataRow(table, labelFont, valueFont, "Peso Ideal", circ.getPesoIdeal() != null ? format(circ.getPesoIdeal()) + " kg" : "—");

        doc.add(table);
    }

    private void addClassifications(Document doc, Font labelFont, Font valueFont,
                                     AnthropometricDataModel antropo, String sexo) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 0.8f, 1.2f, 0.8f});
        table.setSpacingAfter(12f);

        String classIMC = classificarIMC(antropo.getImc());
        String classGordura = classificarGorduraCorporal(antropo.getPorcentagemGordura(), sexo);
        String classVisceral = classificarGorduraVisceral(antropo.getGorduraVisceral());

        addDataRow(table, labelFont, valueFont, "IMC", classIMC);
        addDataRow(table, labelFont, valueFont, "Gordura Corporal", classGordura);

        addDataRow(table, labelFont, valueFont, "Gordura Visceral", classVisceral);

        // Célula vazia para completar a row
        PdfPCell emptyLabel = new PdfPCell(new Phrase("", labelFont));
        emptyLabel.setBorder(PdfPCell.NO_BORDER);
        emptyLabel.setBackgroundColor(LIGHT_GRAY);
        emptyLabel.setPadding(6f);
        table.addCell(emptyLabel);
        PdfPCell emptyValue = new PdfPCell(new Phrase("", valueFont));
        emptyValue.setBorder(PdfPCell.NO_BORDER);
        emptyValue.setPadding(6f);
        table.addCell(emptyValue);

        doc.add(table);
    }

    private void addReferenceValues(Document doc, Font refFont, String sexo, Integer idade) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);

        boolean isFeminino = sexo != null && sexo.toLowerCase().contains("feminino");
        String faixaEtaria = getFaixaEtaria(idade);

        StringBuilder sb = new StringBuilder();
        sb.append("Valores de referência considerados normais");
        if (isFeminino) {
            sb.append(" para mulheres");
        } else {
            sb.append(" para homens");
        }
        sb.append(" (").append(faixaEtaria).append("):\n\n");

        if (isFeminino) {
            sb.append("• Gordura corporal: 21,0% - 32,9%\n");
            sb.append("• Gordura visceral: ≤ 9,0%\n");
            sb.append("• IMC: 18,5 - 24,99 kg/m²\n");
            sb.append("• Músculo esquelético: 24,3% - 30,3%\n");
        } else {
            sb.append("• Gordura corporal: 8,0% - 19,9%\n");
            sb.append("• Gordura visceral: ≤ 9,0%\n");
            sb.append("• IMC: 18,5 - 24,99 kg/m²\n");
            sb.append("• Músculo esquelético: 33,3% - 39,3%\n");
        }

        PdfPCell cell = new PdfPCell(new Phrase(sb.toString(), refFont));
        cell.setBorderColor(BORDER_COLOR);
        cell.setPadding(12f);
        cell.setBackgroundColor(LIGHT_GRAY);
        table.addCell(cell);

        doc.add(table);
    }

    private void addEvolutionTable(Document doc, Font headerFont, Font cellFont,
                                    List<PatientHistoryModel> historicos) throws DocumentException {
        int cols = Math.min(historicos.size(), 6) + 1;
        PdfPTable table = new PdfPTable(cols);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);

        List<PatientHistoryModel> display = historicos.size() > 6
                ? historicos.subList(historicos.size() - 6, historicos.size())
                : historicos;

        // Header: "Indicador" + datas
        addEvolutionHeaderCell(table, "Indicador", headerFont);
        for (PatientHistoryModel h : display) {
            addEvolutionHeaderCell(table, h.getDataConsulta().format(DATE_FMT), headerFont);
        }

        // Linhas de dados
        addEvolutionRow(table, cellFont, "Peso (kg)", display,
                h -> format(h.getAnthropometricDataModel().getPeso()));
        addEvolutionRow(table, cellFont, "IMC (kg/m²)", display,
                h -> format(h.getAnthropometricDataModel().getImc()));
        addEvolutionRow(table, cellFont, "Gordura (%)", display,
                h -> format(h.getAnthropometricDataModel().getPorcentagemGordura()));
        addEvolutionRow(table, cellFont, "Massa Muscular (kg)", display,
                h -> format(h.getAnthropometricDataModel().getMassaMuscular()));
        addEvolutionRow(table, cellFont, "Gord. Visceral (%)", display,
                h -> format(h.getAnthropometricDataModel().getGorduraVisceral()));
        addEvolutionRow(table, cellFont, "TMB (kcal)", display,
                h -> format(h.getAnthropometricDataModel().getTaxaMetabolicaBasal()));

        doc.add(table);
    }

    private void addConclusion(Document doc, Font font, AnthropometricDataModel antropo,
                                String sexo) throws DocumentException {
        StringBuilder sb = new StringBuilder();

        String classIMC = classificarIMC(antropo.getImc());
        sb.append("O(A) paciente encontra-se em estado de ").append(classIMC.toLowerCase());
        sb.append(", conforme o IMC de ").append(format(antropo.getImc())).append(" kg/m².");

        if (antropo.getIdadeMetabolica() != null && antropo.getIdade() != null) {
            if (antropo.getIdadeMetabolica() < antropo.getIdade()) {
                sb.append(" A idade metabólica do(a) paciente está menor em relação à sua idade real, indicando eficiência metabólica.");
            } else if (antropo.getIdadeMetabolica() > antropo.getIdade()) {
                sb.append(" A idade metabólica do(a) paciente está acima da sua idade real, sugerindo necessidade de ajustes no estilo de vida.");
            }
        }

        String classGordura = classificarGorduraCorporal(antropo.getPorcentagemGordura(), sexo);
        String classVisceral = classificarGorduraVisceral(antropo.getGorduraVisceral());
        sb.append(" A gordura visceral (").append(classVisceral.toLowerCase());
        sb.append(") e gordura corporal (").append(classGordura.toLowerCase());
        sb.append(") foram avaliadas conforme os parâmetros para a faixa etária.");

        Paragraph p = new Paragraph(sb.toString(), font);
        p.setSpacingAfter(12f);
        p.setLeading(16f);
        doc.add(p);
    }

    // =========================================================================
    // Classificações
    // =========================================================================

    private String classificarIMC(Double imc) {
        if (imc == null) return "Não informado";
        if (imc < 18.5) return "Baixo peso";
        if (imc < 25.0) return "Eutrofia";
        if (imc < 30.0) return "Sobrepeso";
        if (imc < 35.0) return "Obesidade Grau I";
        if (imc < 40.0) return "Obesidade Grau II";
        return "Obesidade Grau III";
    }

    private String classificarGorduraCorporal(Double gordura, String sexo) {
        if (gordura == null) return "Não informado";
        boolean fem = sexo != null && sexo.toLowerCase().contains("feminino");
        if (fem) {
            if (gordura < 21.0) return "Abaixo do normal";
            if (gordura <= 32.9) return "Normal";
            if (gordura <= 38.9) return "Elevado";
            return "Muito elevado";
        } else {
            if (gordura < 8.0) return "Abaixo do normal";
            if (gordura <= 19.9) return "Normal";
            if (gordura <= 24.9) return "Elevado";
            return "Muito elevado";
        }
    }

    private String classificarGorduraVisceral(Double visceral) {
        if (visceral == null) return "Não informado";
        if (visceral <= 9.0) return "Normal";
        if (visceral <= 14.0) return "Elevado";
        return "Muito elevado";
    }

    private String getFaixaEtaria(Integer idade) {
        if (idade == null) return "adulto";
        if (idade < 18) return "< 18 anos";
        if (idade <= 39) return "18-39 anos";
        if (idade <= 59) return "40-59 anos";
        return "60+ anos";
    }

    // =========================================================================
    // Helpers de célula
    // =========================================================================

    private void addSection(Document doc, Font font, String text) throws DocumentException {
        doc.add(Chunk.NEWLINE);
        Paragraph p = new Paragraph(text, font);
        p.setSpacingAfter(8f);
        doc.add(p);

        LineSeparator line = new LineSeparator();
        line.setLineColor(PRIMARY_LIGHT);
        line.setLineWidth(1f);
        doc.add(line);

        Paragraph spacer = new Paragraph("");
        spacer.setSpacingAfter(6f);
        doc.add(spacer);
    }

    private void addInfoCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(3f);
        table.addCell(cell);
    }

    private void addDataRow(PdfPTable table, Font labelFont, Font valueFont,
                             String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setBackgroundColor(LIGHT_GRAY);
        labelCell.setPadding(6f);
        labelCell.setPaddingLeft(10f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(PdfPCell.NO_BORDER);
        valueCell.setPadding(6f);
        table.addCell(valueCell);
    }

    private void addEvolutionHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(PRIMARY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(7f);
        cell.setBorderColor(PRIMARY);
        table.addCell(cell);
    }

    @FunctionalInterface
    private interface HistoryExtractor {
        String extract(PatientHistoryModel h);
    }

    private void addEvolutionRow(PdfPTable table, Font cellFont, String label,
                                  List<PatientHistoryModel> historicos, HistoryExtractor extractor) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, cellFont));
        labelCell.setBackgroundColor(ACCENT_LIGHT);
        labelCell.setPadding(5f);
        labelCell.setBorderColor(BORDER_COLOR);
        table.addCell(labelCell);

        for (PatientHistoryModel h : historicos) {
            String val;
            try {
                val = extractor.extract(h);
            } catch (Exception e) {
                val = "—";
            }
            PdfPCell cell = new PdfPCell(new Phrase(val, cellFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5f);
            cell.setBorderColor(BORDER_COLOR);
            table.addCell(cell);
        }
    }

    // =========================================================================
    // Formatação
    // =========================================================================

    private String format(Double d) {
        if (d == null) return "—";
        return String.format("%.1f", d).replace('.', ',');
    }

    private String formatCm(Double d) {
        if (d == null) return "—";
        return String.format("%.1f", d).replace('.', ',') + " cm";
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }
}
