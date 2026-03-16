package fitt_nutri.example.demo.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.*;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BioimpedancePdfService {

    private final PatientRepository patientRepository;
    private final PatientHistoryRepository historyRepository;
    private final UserRepository userRepository;

    private static final Color GREEN_DARK = new Color(46, 125, 50);
    private static final Color GREEN_LIGHT = new Color(232, 245, 233);
    private static final Color GREEN_HEADER = new Color(220, 245, 220);
    private static final Color WHITE = new Color(255, 255, 255);
    private static final Color RED_LIGHT = new Color(255, 205, 210);
    private static final Color YELLOW_LIGHT = new Color(255, 249, 196);
    private static final Color GREEN_STATUS = new Color(200, 230, 201);

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, Color.WHITE);
    private static final Font SECTION_FONT = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(46, 125, 50));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);
    private static final Font TEXT_FONT = new Font(Font.HELVETICA, 10);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 9);
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);
    private static final Font FOOTER_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(80, 80, 80));
    private static final Font CONCLUSION_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(60, 60, 60));

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional
    public byte[] generateBioimpedancePdf(Integer patientId, Integer nutricionistaId) throws Exception {

        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        UserModel nutri = userRepository.findById(nutricionistaId)
                .orElseThrow(() -> new NotFoundException("Nutricionista não encontrado"));

        List<PatientHistoryModel> historicos =
                historyRepository.findByPatientModelIdOrderByDataConsultaAsc(patientId);

        if (historicos.isEmpty()) {
            throw new NotFoundException("Nenhuma consulta encontrada para o paciente");
        }

        PatientHistoryModel latest = historicos.get(historicos.size() - 1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        addHeader(doc, patient, nutri, latest);
        addDadosCalculados(doc, latest.getAnthropometricDataModel());
        addCircunferencias(doc, latest.getDataCircleModel());
        addClassificacoes(doc, latest.getAnthropometricDataModel(), patient.getSexo());
        addValoresReferencia(doc, patient.getSexo());

        if (historicos.size() > 1) {
            addEvolucao(doc, historicos);
        }

        addConclusao(doc, latest.getAnthropometricDataModel(), patient.getSexo());
        addFooter(doc, nutri);

        doc.close();
        return out.toByteArray();
    }

    private void addHeader(Document doc, PatientModel patient, UserModel nutri, PatientHistoryModel latest) throws DocumentException {
        PdfPTable titleTable = new PdfPTable(1);
        titleTable.setWidthPercentage(100);
        PdfPCell titleCell = new PdfPCell(new Phrase("RELATÓRIO DE BIOIMPEDÂNCIA", TITLE_FONT));
        titleCell.setBackgroundColor(GREEN_DARK);
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        titleCell.setPadding(14f);
        titleCell.setBorder(PdfPCell.NO_BORDER);
        titleTable.addCell(titleCell);
        titleTable.setSpacingAfter(14f);
        doc.add(titleTable);

        PdfPTable infoTable = new PdfPTable(new float[]{1f, 1f});
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingAfter(16f);

        addInfoCell(infoTable, "Paciente: " + safe(patient.getNome()), true);
        String dataAvaliacao = latest.getDataConsulta() != null ? latest.getDataConsulta().format(DATE_FMT) : "-";
        addInfoCell(infoTable, "Data da Avaliação: " + dataAvaliacao, true);

        addInfoCell(infoTable, "Sexo: " + safe(patient.getSexo()), false);
        addInfoCell(infoTable, "Nutricionista: " + safe(nutri.getNome()) + " - CRN: " + safe(nutri.getCrn()), false);

        doc.add(infoTable);
    }

    private void addDadosCalculados(Document doc, AnthropometricDataModel a) throws DocumentException {
        addSectionTitle(doc, "Dados Calculados");

        PdfPTable table = new PdfPTable(new float[]{1.5f, 1f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(14f);

        addDataRow(table, "Altura", a != null && a.getAltura() != null ? format(a.getAltura()) + " cm" : "-");
        addDataRow(table, "Peso", a != null && a.getPeso() != null ? format(a.getPeso()) + " kg" : "-");
        addDataRow(table, "IMC", a != null && a.getImc() != null ? format(a.getImc()) + " kg/m²" : "-");
        addDataRow(table, "Gordura Corporal", a != null && a.getPorcentagemGordura() != null ? format(a.getPorcentagemGordura()) + "%" : "-");
        addDataRow(table, "Massa Muscular", a != null && a.getMassaMuscular() != null ? format(a.getMassaMuscular()) + "%" : "-");
        addDataRow(table, "Gordura Visceral", a != null && a.getGorduraVisceral() != null ? format(a.getGorduraVisceral()) + "%" : "-");
        addDataRow(table, "Taxa Metabólica Basal", a != null && a.getTaxaMetabolicaBasal() != null ? Math.round(a.getTaxaMetabolicaBasal()) + " kcal" : "-");
        addDataRow(table, "Idade Metabólica", a != null && a.getIdadeMetabolica() != null ? a.getIdadeMetabolica() + " anos" : "-");
        addDataRow(table, "Idade Real", a != null && a.getIdade() != null ? a.getIdade() + " anos" : "-");

        doc.add(table);
    }

    private void addCircunferencias(Document doc, DataCircleModel c) throws DocumentException {
        addSectionTitle(doc, "Circunferências");

        PdfPTable table = new PdfPTable(new float[]{1.5f, 1f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(14f);

        addDataRow(table, "Circunferência Abdominal", c != null && c.getAbdominal() != null ? format(c.getAbdominal()) + " cm" : "-");
        addDataRow(table, "Circunferência de Cintura", c != null && c.getCintura() != null ? format(c.getCintura()) + " cm" : "-");
        addDataRow(table, "Circunferência de Quadril", c != null && c.getQuadril() != null ? format(c.getQuadril()) + " cm" : "-");
        addDataRow(table, "Circunferência de Braço", c != null && c.getBraco() != null ? format(c.getBraco()) + " cm" : "-");
        addDataRow(table, "Circunferência de Coxa", c != null && c.getCoxa() != null ? format(c.getCoxa()) + " cm" : "-");
        addDataRow(table, "Circunferência de Panturrilha", c != null && c.getPanturrilha() != null ? format(c.getPanturrilha()) + " cm" : "-");
        addDataRow(table, "Circunferência de Pulso", c != null && c.getPulso() != null ? format(c.getPulso()) + " cm" : "-");

        doc.add(table);
    }

    private void addClassificacoes(Document doc, AnthropometricDataModel a, String sexo) throws DocumentException {
        addSectionTitle(doc, "Classificações");

        PdfPTable table = new PdfPTable(new float[]{1.5f, 1f, 1f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(14f);

        addHeaderCellGreen(table, "Indicador");
        addHeaderCellGreen(table, "Valor");
        addHeaderCellGreen(table, "Classificação");

        Double imc = a != null ? a.getImc() : null;
        String imcClass = classifyImc(imc);
        Color imcColor = colorForClassification(imcClass);
        addClassRow(table, "IMC", imc != null ? format(imc) + " kg/m²" : "-", imcClass, imcColor);

        Double gordura = a != null ? a.getPorcentagemGordura() : null;
        String gorduraClass = classifyGordura(gordura, sexo);
        Color gorduraColor = colorForClassification(gorduraClass);
        addClassRow(table, "Gordura Corporal", gordura != null ? format(gordura) + "%" : "-", gorduraClass, gorduraColor);

        Double visceral = a != null ? a.getGorduraVisceral() : null;
        String visceralClass = classifyGorduraVisceral(visceral);
        Color visceralColor = colorForClassification(visceralClass);
        addClassRow(table, "Gordura Visceral", visceral != null ? format(visceral) + "%" : "-", visceralClass, visceralColor);

        doc.add(table);
    }

    private void addValoresReferencia(Document doc, String sexo) throws DocumentException {
        addSectionTitle(doc, "Valores de Referência");

        boolean isFem = sexo != null && sexo.toLowerCase().contains("fem");

        PdfPTable table = new PdfPTable(new float[]{1.5f, 1.5f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(14f);

        addHeaderCellGreen(table, "Indicador");
        addHeaderCellGreen(table, "Faixa Normal (" + (isFem ? "Feminino" : "Masculino") + ")");

        addDataRow(table, "IMC", "18,5 - 24,9 kg/m²");

        if (isFem) {
            addDataRow(table, "Gordura Corporal (18-39 anos)", "21,0% - 32,9%");
            addDataRow(table, "Massa Muscular (18-39 anos)", "24,3% - 30,3%");
        } else {
            addDataRow(table, "Gordura Corporal (18-39 anos)", "8,0% - 19,9%");
            addDataRow(table, "Massa Muscular (18-39 anos)", "33,3% - 39,3%");
        }

        addDataRow(table, "Gordura Visceral", "1 - 9 (Normal)");

        doc.add(table);
    }

    private void addEvolucao(Document doc, List<PatientHistoryModel> historicos) throws DocumentException {
        addSectionTitle(doc, "Evolução");

        PdfPTable table = new PdfPTable(new float[]{1.2f, 1f, 1f, 1f, 1f, 1f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(14f);

        addHeaderCellGreen(table, "Data");
        addHeaderCellGreen(table, "Peso (kg)");
        addHeaderCellGreen(table, "IMC");
        addHeaderCellGreen(table, "Gordura (%)");
        addHeaderCellGreen(table, "M. Muscular");
        addHeaderCellGreen(table, "G. Visceral");

        for (PatientHistoryModel h : historicos) {
            AnthropometricDataModel a = h.getAnthropometricDataModel();
            String data = h.getDataConsulta() != null ? h.getDataConsulta().format(DATE_FMT) : "-";
            addCenteredCell(table, data);
            addCenteredCell(table, a != null && a.getPeso() != null ? format(a.getPeso()) : "-");
            addCenteredCell(table, a != null && a.getImc() != null ? format(a.getImc()) : "-");
            addCenteredCell(table, a != null && a.getPorcentagemGordura() != null ? format(a.getPorcentagemGordura()) : "-");
            addCenteredCell(table, a != null && a.getMassaMuscular() != null ? format(a.getMassaMuscular()) : "-");
            addCenteredCell(table, a != null && a.getGorduraVisceral() != null ? format(a.getGorduraVisceral()) : "-");
        }

        doc.add(table);
    }

    private void addConclusao(Document doc, AnthropometricDataModel a, String sexo) throws DocumentException {
        addSectionTitle(doc, "Conclusão");

        Double imc = a != null ? a.getImc() : null;
        Double gordura = a != null ? a.getPorcentagemGordura() : null;
        Double visceral = a != null ? a.getGorduraVisceral() : null;
        Integer idadeMetabolica = a != null ? a.getIdadeMetabolica() : null;
        Integer idade = a != null ? a.getIdade() : null;

        StringBuilder sb = new StringBuilder();
        sb.append("Com base nos dados avaliados, o(a) paciente apresenta ");
        sb.append("IMC classificado como ").append(classifyImc(imc));

        sb.append(", gordura corporal classificada como ").append(classifyGordura(gordura, sexo));
        sb.append(" e gordura visceral classificada como ").append(classifyGorduraVisceral(visceral)).append(".");

        if (idadeMetabolica != null && idade != null) {
            if (idadeMetabolica < idade) {
                sb.append(" A idade metabólica (").append(idadeMetabolica)
                  .append(" anos) está menor que a idade real (").append(idade)
                  .append(" anos), indicando eficiência metabólica.");
            } else if (idadeMetabolica > idade) {
                sb.append(" A idade metabólica (").append(idadeMetabolica)
                  .append(" anos) está acima da idade real (").append(idade)
                  .append(" anos), sugerindo necessidade de atenção ao estilo de vida.");
            } else {
                sb.append(" A idade metabólica é compatível com a idade real.");
            }
        }

        Paragraph p = new Paragraph(sb.toString(), CONCLUSION_FONT);
        p.setSpacingAfter(16f);
        p.setLeading(16f);
        doc.add(p);
    }

    private void addFooter(Document doc, UserModel nutri) throws DocumentException {
        Paragraph line = new Paragraph(" ");
        line.setSpacingBefore(20f);
        doc.add(line);

        com.lowagie.text.pdf.draw.LineSeparator sep = new com.lowagie.text.pdf.draw.LineSeparator();
        sep.setLineColor(new Color(180, 180, 180));
        doc.add(sep);

        Paragraph nome = new Paragraph(safe(nutri.getNome()), FOOTER_FONT);
        nome.setAlignment(Element.ALIGN_CENTER);
        nome.setSpacingBefore(10f);
        doc.add(nome);

        Paragraph titulo = new Paragraph("Nutricionista - CRN: " + safe(nutri.getCrn()), new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(100, 100, 100)));
        titulo.setAlignment(Element.ALIGN_CENTER);
        doc.add(titulo);
    }

    // === Helpers ===

    private void addSectionTitle(Document doc, String title) throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        PdfPCell c = new PdfPCell(new Phrase(title, SECTION_FONT));
        c.setBackgroundColor(GREEN_LIGHT);
        c.setPadding(8f);
        c.setBorder(PdfPCell.NO_BORDER);
        t.addCell(c);
        t.setSpacingBefore(10f);
        t.setSpacingAfter(6f);
        doc.add(t);
    }

    private void addInfoCell(PdfPTable table, String text, boolean bold) {
        Font f = bold ? BOLD_FONT : TEXT_FONT;
        PdfPCell c = new PdfPCell(new Phrase(text, f));
        c.setBorder(PdfPCell.NO_BORDER);
        c.setPadding(5f);
        table.addCell(c);
    }

    private void addDataRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, BOLD_FONT));
        labelCell.setBorder(PdfPCell.BOTTOM);
        labelCell.setBorderColor(new Color(230, 230, 230));
        labelCell.setPadding(6f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, TEXT_FONT));
        valueCell.setBorder(PdfPCell.BOTTOM);
        valueCell.setBorderColor(new Color(230, 230, 230));
        valueCell.setPadding(6f);
        valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(valueCell);
    }

    private void addHeaderCellGreen(PdfPTable table, String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, HEADER_FONT));
        c.setBackgroundColor(GREEN_HEADER);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setPadding(6f);
        table.addCell(c);
    }

    private void addCenteredCell(PdfPTable table, String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, SMALL_FONT));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setPadding(5f);
        c.setBorder(PdfPCell.BOTTOM);
        c.setBorderColor(new Color(230, 230, 230));
        table.addCell(c);
    }

    private void addClassRow(PdfPTable table, String label, String value, String classification, Color bgColor) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, BOLD_FONT));
        labelCell.setPadding(6f);
        labelCell.setBorder(PdfPCell.BOTTOM);
        labelCell.setBorderColor(new Color(230, 230, 230));
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, TEXT_FONT));
        valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        valueCell.setPadding(6f);
        valueCell.setBorder(PdfPCell.BOTTOM);
        valueCell.setBorderColor(new Color(230, 230, 230));
        table.addCell(valueCell);

        PdfPCell classCell = new PdfPCell(new Phrase(classification, BOLD_FONT));
        classCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        classCell.setBackgroundColor(bgColor);
        classCell.setPadding(6f);
        classCell.setBorder(PdfPCell.BOTTOM);
        classCell.setBorderColor(new Color(230, 230, 230));
        table.addCell(classCell);
    }

    // === Classificações ===

    private String classifyImc(Double imc) {
        if (imc == null) return "Dados insuficientes";
        if (imc < 18.5) return "Magreza";
        if (imc < 25.0) return "Eutrofia";
        if (imc < 30.0) return "Sobrepeso";
        if (imc < 35.0) return "Obesidade Grau I";
        if (imc < 40.0) return "Obesidade Grau II";
        return "Obesidade Grau III";
    }

    private String classifyGordura(Double gordura, String sexo) {
        if (gordura == null) return "Dados insuficientes";
        boolean isFem = sexo != null && sexo.toLowerCase().contains("fem");
        if (isFem) {
            if (gordura < 21.0) return "Abaixo do normal";
            if (gordura <= 32.9) return "Normal";
            return "Acima do normal";
        } else {
            if (gordura < 8.0) return "Abaixo do normal";
            if (gordura <= 19.9) return "Normal";
            return "Acima do normal";
        }
    }

    private String classifyGorduraVisceral(Double visceral) {
        if (visceral == null) return "Dados insuficientes";
        if (visceral <= 9.0) return "Normal";
        if (visceral <= 14.0) return "Alto";
        return "Muito Alto";
    }

    private Color colorForClassification(String classification) {
        if (classification == null) return WHITE;
        return switch (classification) {
            case "Eutrofia", "Normal" -> GREEN_STATUS;
            case "Magreza", "Abaixo do normal", "Sobrepeso" -> YELLOW_LIGHT;
            case "Acima do normal", "Alto", "Muito Alto",
                 "Obesidade Grau I", "Obesidade Grau II", "Obesidade Grau III" -> RED_LIGHT;
            default -> WHITE;
        };
    }

    private String format(Double d) {
        return String.format("%.1f", d != null ? d : 0.0);
    }

    private String safe(String s) {
        return s != null ? s : "-";
    }
}
