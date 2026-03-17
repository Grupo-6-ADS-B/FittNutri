package fitt_nutri.example.demo.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.*;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BioimpedancePdfService {

    private final PatientRepository patientRepository;
    private final PatientHistoryRepository historyRepository;
    private final UserRepository userRepository;

    // === Cores ===
    private static final Color GREEN_DARK = new Color(46, 125, 50);
    private static final Color GREEN_LIGHT = new Color(232, 245, 233);
    private static final Color GREEN_HEADER = new Color(220, 245, 220);
    private static final Color WHITE = new Color(255, 255, 255);
    private static final Color RED_LIGHT = new Color(255, 205, 210);
    private static final Color YELLOW_LIGHT = new Color(255, 249, 196);
    private static final Color GREEN_STATUS = new Color(200, 230, 201);
    private static final Color BODY_FILL = new Color(200, 215, 230);
    private static final Color BODY_OUTLINE = new Color(140, 160, 180);
    private static final Color LABEL_LINE = new Color(100, 100, 100);
    private static final Color PIE_FAT = new Color(229, 115, 115);    // vermelho suave para gordura
    private static final Color PIE_LEAN = new Color(100, 181, 246);   // azul para massa magra
    private static final Color GREEN_GRADIENT_START = new Color(56, 142, 60);
    private static final Color GREEN_GRADIENT_END = new Color(27, 94, 32);

    // === Fontes ===
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, Color.WHITE);
    private static final Font SECTION_FONT = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(46, 125, 50));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);
    private static final Font TEXT_FONT = new Font(Font.HELVETICA, 10);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 9);
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);
    private static final Font FOOTER_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(80, 80, 80));
    private static final Font CONCLUSION_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(60, 60, 60));
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 8, Font.BOLD, new Color(60, 60, 60));
    private static final Font VALUE_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, new Color(46, 125, 50));

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional
    public byte[] generateBioimpedancePdf(Integer patientId) throws Exception {

        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        UserModel nutri = userRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new NotFoundException("Nutricionista não encontrado"));

        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        if (patient.getNutricionista() == null ||
                !patient.getNutricionista().getId().equals(nutri.getId())) {
            throw new AccessDeniedException("Acesso negado: este paciente não pertence ao nutricionista logado");
        }

        List<PatientHistoryModel> historicos =
                historyRepository.findByPatientModelIdOrderByDataConsultaAsc(patientId);

        if (historicos.isEmpty()) {
            throw new NotFoundException("Nenhuma consulta encontrada para o paciente");
        }

        PatientHistoryModel latest = historicos.get(historicos.size() - 1);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter writer = PdfWriter.getInstance(doc, out);
        doc.open();

        // Página 1: Header gradiente + Boneco com circunferências + Classificações
        addGradientHeader(writer, doc);
        addPatientInfo(doc, patient, nutri, latest);
        addBodySilhouetteSection(writer, doc, latest.getDataCircleModel(), latest.getAnthropometricDataModel(), patient.getSexo());
        addCompositionPieChart(writer, doc, latest.getAnthropometricDataModel());

        // Página 2: Dados detalhados + Evolução + Conclusão
        doc.newPage();
        addDadosCalculados(doc, latest.getAnthropometricDataModel());
        addCircunferenciasTable(doc, latest.getDataCircleModel());
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

    // =========================================================================
    // Seção do boneco anatômico com circunferências
    // =========================================================================

    private void addBodySilhouetteSection(PdfWriter writer, Document doc, DataCircleModel circ,
                                           AnthropometricDataModel antro, String sexo) throws DocumentException {
        addSectionTitle(doc, "Mapa Corporal de Circunferências");

        // Reservar espaço no documento para o desenho
        doc.add(new Paragraph(" ")); // pequeno espaço
        float startY = writer.getVerticalPosition(true);

        // A silhueta ocupa ~400pt de altura
        float silhouetteHeight = 380f;

        // Adicionar espaço no documento
        Paragraph spacer = new Paragraph();
        spacer.setSpacingBefore(silhouetteHeight);
        doc.add(spacer);

        PdfContentByte cb = writer.getDirectContent();

        // Centro da silhueta na página
        float centerX = doc.getPageSize().getWidth() / 2f;
        float topY = startY - 10f;

        // Desenhar silhueta
        drawBodySilhouette(cb, centerX, topY, sexo);

        // Desenhar labels com linhas guia
        drawCircumferenceLabels(cb, centerX, topY, circ);

        // Adicionar mini-cards de classificação ao lado
        drawClassificationCards(cb, centerX, topY, antro, sexo);
    }

    private void drawBodySilhouette(PdfContentByte cb, float cx, float topY, String sexo) {
        boolean isFem = sexo != null && sexo.toLowerCase().contains("fem");

        cb.saveState();

        // Escala do boneco
        float scale = 1.0f;
        float headR = 18f * scale;
        float headY = topY - headR;

        // === CABEÇA (círculo) ===
        cb.setColorFill(BODY_FILL);
        cb.setColorStroke(BODY_OUTLINE);
        cb.setLineWidth(1.5f);
        cb.circle(cx, headY, headR);
        cb.fillStroke();

        // === PESCOÇO ===
        float neckTop = headY - headR;
        float neckBot = neckTop - 12f * scale;
        float neckW = 8f * scale;
        cb.moveTo(cx - neckW, neckTop);
        cb.lineTo(cx - neckW, neckBot);
        cb.lineTo(cx + neckW, neckBot);
        cb.lineTo(cx + neckW, neckTop);
        cb.closePath();
        cb.fillStroke();

        // === TORSO ===
        float shoulderW = isFem ? 48f * scale : 55f * scale;
        float waistW = isFem ? 35f * scale : 42f * scale;
        float hipW = isFem ? 50f * scale : 44f * scale;
        float shoulderY = neckBot;
        float waistY = shoulderY - 70f * scale;
        float hipY = waistY - 35f * scale;

        cb.moveTo(cx - shoulderW, shoulderY);
        cb.curveTo(cx - shoulderW, shoulderY - 20f * scale,
                   cx - waistW, waistY + 10f * scale,
                   cx - waistW, waistY);
        cb.curveTo(cx - waistW, waistY - 10f * scale,
                   cx - hipW, hipY + 10f * scale,
                   cx - hipW, hipY);
        cb.lineTo(cx + hipW, hipY);
        cb.curveTo(cx + hipW, hipY + 10f * scale,
                   cx + waistW, waistY - 10f * scale,
                   cx + waistW, waistY);
        cb.curveTo(cx + waistW, waistY + 10f * scale,
                   cx + shoulderW, shoulderY - 20f * scale,
                   cx + shoulderW, shoulderY);
        cb.closePath();
        cb.fillStroke();

        // === BRAÇOS ===
        float armTopW = 12f * scale;
        float armBotW = 9f * scale;
        float armLength = 110f * scale;
        float elbowY = shoulderY - 55f * scale;
        float handY = shoulderY - armLength;

        // Braço esquerdo
        drawArm(cb, cx - shoulderW, shoulderY, cx - shoulderW - 30f * scale, elbowY,
                cx - shoulderW - 35f * scale, handY, armTopW, armBotW, scale);
        // Braço direito
        drawArm(cb, cx + shoulderW, shoulderY, cx + shoulderW + 30f * scale, elbowY,
                cx + shoulderW + 35f * scale, handY, armTopW, armBotW, scale);

        // === PERNAS ===
        float legTopW = isFem ? 22f * scale : 20f * scale;
        float kneeW = 14f * scale;
        float ankleW = 9f * scale;
        float legGap = 4f * scale;
        float kneeY = hipY - 90f * scale;
        float ankleY = hipY - 170f * scale;
        float footY = ankleY - 10f * scale;

        // Perna esquerda
        drawLeg(cb, cx - legGap - legTopW, cx - legGap, hipY, kneeY, ankleY, footY, legTopW, kneeW, ankleW, true);
        // Perna direita
        drawLeg(cb, cx + legGap, cx + legGap + legTopW, hipY, kneeY, ankleY, footY, legTopW, kneeW, ankleW, false);

        cb.restoreState();
    }

    private void drawArm(PdfContentByte cb, float shoulderX, float shoulderY,
                          float elbowX, float elbowY, float handX, float handY,
                          float topW, float botW, float scale) {
        cb.setColorFill(BODY_FILL);
        cb.setColorStroke(BODY_OUTLINE);
        cb.setLineWidth(1.5f);

        float dir = shoulderX < handX ? -1f : 1f;

        // Contorno do braço usando linhas
        cb.moveTo(shoulderX, shoulderY);
        cb.lineTo(elbowX - botW * dir * 0.5f, elbowY);
        cb.lineTo(handX - botW * dir * 0.3f, handY);
        // Mão (pequeno círculo)
        cb.lineTo(handX + botW * dir * 0.3f, handY - 5f * scale);
        cb.lineTo(handX + botW * dir * 0.3f, handY);
        cb.lineTo(elbowX + botW * dir * 0.5f, elbowY);
        cb.lineTo(shoulderX, shoulderY - 5f);
        cb.closePath();
        cb.fillStroke();
    }

    private void drawLeg(PdfContentByte cb, float leftX, float rightX, float hipY,
                          float kneeY, float ankleY, float footY,
                          float topW, float kneeW, float ankleW, boolean isLeft) {
        cb.setColorFill(BODY_FILL);
        cb.setColorStroke(BODY_OUTLINE);
        cb.setLineWidth(1.5f);

        float midX = (leftX + rightX) / 2f;

        cb.moveTo(leftX, hipY);
        cb.curveTo(leftX - 2f, hipY - 30f, midX - kneeW, kneeY + 20f, midX - kneeW, kneeY);
        cb.curveTo(midX - kneeW, kneeY - 20f, midX - ankleW, ankleY + 20f, midX - ankleW, ankleY);
        cb.lineTo(midX - ankleW - 5f, footY); // pé
        cb.lineTo(midX + ankleW + 5f, footY);
        cb.lineTo(midX + ankleW, ankleY);
        cb.curveTo(midX + ankleW, ankleY + 20f, midX + kneeW, kneeY - 20f, midX + kneeW, kneeY);
        cb.curveTo(midX + kneeW, kneeY + 20f, rightX + 2f, hipY - 30f, rightX, hipY);
        cb.closePath();
        cb.fillStroke();
    }

    private void drawCircumferenceLabels(PdfContentByte cb, float cx, float topY, DataCircleModel c) {
        if (c == null) return;

        cb.saveState();
        cb.setColorStroke(LABEL_LINE);
        cb.setLineDash(3f, 2f);
        cb.setLineWidth(0.8f);

        float headR = 18f;
        float shoulderY = topY - headR - headR - 12f;

        // Posições Y dos pontos de medida no corpo
        float bracoY = shoulderY - 45f;       // braço
        float cinturaY = shoulderY - 70f;      // cintura
        float abdominalY = shoulderY - 85f;    // abdominal
        float quadrilY = shoulderY - 105f;     // quadril
        float coxaY = shoulderY - 155f;        // coxa
        float panturrilhaY = shoulderY - 230f; // panturrilha
        float pulsoY = shoulderY - 120f;       // pulso

        // Labels lado esquerdo (com numeração)
        drawLabel(cb, cx, bracoY, cx - 130f, bracoY + 10f, "1", "Braco",
                c.getBraco() != null ? format(c.getBraco()) + " cm" : "-", true);
        drawLabel(cb, cx, cinturaY, cx - 130f, cinturaY + 10f, "2", "Cintura",
                c.getCintura() != null ? format(c.getCintura()) + " cm" : "-", true);
        drawLabel(cb, cx, quadrilY, cx - 130f, quadrilY + 10f, "3", "Quadril",
                c.getQuadril() != null ? format(c.getQuadril()) + " cm" : "-", true);
        drawLabel(cb, cx, panturrilhaY, cx - 130f, panturrilhaY + 10f, "4", "Panturrilha",
                c.getPanturrilha() != null ? format(c.getPanturrilha()) + " cm" : "-", true);

        // Labels lado direito (com numeração)
        drawLabel(cb, cx, abdominalY, cx + 130f, abdominalY + 10f, "5", "Abdominal",
                c.getAbdominal() != null ? format(c.getAbdominal()) + " cm" : "-", false);
        drawLabel(cb, cx, coxaY, cx + 130f, coxaY + 10f, "6", "Coxa",
                c.getCoxa() != null ? format(c.getCoxa()) + " cm" : "-", false);
        drawLabel(cb, cx, pulsoY, cx + 130f, pulsoY + 10f, "7", "Pulso",
                c.getPulso() != null ? format(c.getPulso()) + " cm" : "-", false);

        cb.restoreState();
    }

    private void drawLabel(PdfContentByte cb, float bodyX, float bodyY,
                            float labelX, float labelY, String number, String label, String value, boolean isLeft) {
        // Linha guia
        float lineStartX = isLeft ? bodyX - 50f : bodyX + 50f;
        cb.moveTo(lineStartX, bodyY);
        cb.lineTo(labelX, labelY);
        cb.stroke();

        // Ponto numerado no corpo
        cb.saveState();
        cb.setColorFill(GREEN_DARK);
        cb.setLineDash(0);
        cb.circle(lineStartX, bodyY, 7f);
        cb.fill();

        // Número dentro do círculo
        cb.setColorFill(Color.WHITE);
        ColumnText numCt = new ColumnText(cb);
        numCt.setSimpleColumn(lineStartX - 4f, bodyY - 5f, lineStartX + 4f, bodyY + 5f);
        Paragraph numP = new Paragraph(number, new Font(Font.HELVETICA, 7, Font.BOLD, Color.WHITE));
        numP.setAlignment(Element.ALIGN_CENTER);
        numCt.addElement(numP);
        numCt.go();
        cb.restoreState();

        // Texto do label
        float textX = isLeft ? labelX - 70f : labelX + 5f;
        ColumnText ct = new ColumnText(cb);

        Phrase labelPhrase = new Phrase(number + ". " + label + "\n", LABEL_FONT);
        Phrase valuePhrase = new Phrase(value, VALUE_FONT);

        Paragraph p = new Paragraph();
        p.add(labelPhrase);
        p.add(valuePhrase);
        p.setAlignment(isLeft ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);

        float boxW = 80f;
        ct.setSimpleColumn(textX, labelY - 20f, textX + boxW, labelY + 15f);
        ct.addElement(p);
        ct.go();
    }

    private void drawClassificationCards(PdfContentByte cb, float cx, float topY,
                                          AnthropometricDataModel a, String sexo) {
        float cardX = cx + 145f;
        float cardY = topY - 20f;
        float cardW = 130f;
        float cardH = 45f;
        float gap = 8f;

        // Card IMC
        Double imc = a != null ? a.getImc() : null;
        String imcClass = classifyImc(imc);
        drawClassCard(cb, cardX, cardY, cardW, cardH,
                "Classificacao IMC", imc != null ? format(imc) + " kg/m2" : "-",
                statusIcon(imcClass) + " " + imcClass, colorForClassification(imcClass));
        cardY -= (cardH + gap);

        // Card Gordura
        Double gordura = a != null ? a.getPorcentagemGordura() : null;
        String gorduraClass = classifyGordura(gordura, sexo);
        drawClassCard(cb, cardX, cardY, cardW, cardH,
                "Gordura Corporal", gordura != null ? format(gordura) + "%" : "-",
                statusIcon(gorduraClass) + " " + gorduraClass, colorForClassification(gorduraClass));
        cardY -= (cardH + gap);

        // Card Gordura Visceral
        Double visceral = a != null ? a.getGorduraVisceral() : null;
        String visceralClass = classifyGorduraVisceral(visceral);
        drawClassCard(cb, cardX, cardY, cardW, cardH,
                "Gordura Visceral", visceral != null ? format(visceral) : "-",
                statusIcon(visceralClass) + " " + visceralClass, colorForClassification(visceralClass));
        cardY -= (cardH + gap);

        // Card Massa Muscular
        Double massa = a != null ? a.getMassaMuscular() : null;
        drawClassCard(cb, cardX, cardY, cardW, cardH,
                "Massa Muscular", massa != null ? format(massa) + "%" : "-", "",
                GREEN_LIGHT);
    }

    private void drawClassCard(PdfContentByte cb, float x, float y, float w, float h,
                                String title, String value, String classification, Color bgColor) {
        cb.saveState();

        // Fundo do card
        cb.setColorFill(new Color(248, 248, 248));
        cb.setColorStroke(new Color(220, 220, 220));
        cb.setLineWidth(0.5f);
        cb.setLineDash(0);
        cb.roundRectangle(x, y - h, w, h, 4f);
        cb.fillStroke();

        // Barra lateral colorida
        cb.setColorFill(bgColor);
        cb.rectangle(x, y - h, 4f, h);
        cb.fill();

        // Título
        ColumnText ct = new ColumnText(cb);
        ct.setSimpleColumn(x + 8f, y - 14f, x + w - 4f, y);
        ct.addElement(new Phrase(title, new Font(Font.HELVETICA, 7, Font.BOLD, new Color(100, 100, 100))));
        ct.go();

        // Valor
        ct = new ColumnText(cb);
        ct.setSimpleColumn(x + 8f, y - 28f, x + w - 4f, y - 12f);
        ct.addElement(new Phrase(value, new Font(Font.HELVETICA, 11, Font.BOLD, new Color(40, 40, 40))));
        ct.go();

        // Classificação
        if (classification != null && !classification.isEmpty()) {
            ct = new ColumnText(cb);
            ct.setSimpleColumn(x + 8f, y - h, x + w - 4f, y - 26f);
            ct.addElement(new Phrase(classification, new Font(Font.HELVETICA, 8, Font.BOLD, GREEN_DARK)));
            ct.go();
        }

        cb.restoreState();
    }

    // =========================================================================
    // Seções de tabela (página 2)
    // =========================================================================

    private void addGradientHeader(PdfWriter writer, Document doc) throws DocumentException {
        float pageW = doc.getPageSize().getWidth();
        float headerH = 50f;
        float headerY = doc.getPageSize().getHeight() - doc.topMargin();

        PdfContentByte cb = writer.getDirectContentUnder();
        PdfTemplate template = cb.createTemplate(pageW, headerH);
        Graphics2D g2d = template.createGraphics(pageW, headerH);

        GradientPaint gradient = new GradientPaint(0, 0, GREEN_GRADIENT_START, pageW, 0, GREEN_GRADIENT_END);
        g2d.setPaint(gradient);
        g2d.fill(new Rectangle2D.Float(0, 0, pageW, headerH));
        g2d.dispose();

        cb.addTemplate(template, 0, headerY - headerH);

        // Título sobre o gradiente
        Paragraph title = new Paragraph("RELATÓRIO DE BIOIMPEDÂNCIA", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(14f);
        doc.add(title);
    }

    private void addPatientInfo(Document doc, PatientModel patient, UserModel nutri, PatientHistoryModel latest) throws DocumentException {
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

    private void addCompositionPieChart(PdfWriter writer, Document doc, AnthropometricDataModel a) throws DocumentException {
        if (a == null || a.getPorcentagemGordura() == null) return;

        double gordura = a.getPorcentagemGordura();
        double magra = 100.0 - gordura;

        addSectionTitle(doc, "Composição Corporal Atual");

        doc.add(new Paragraph(" "));
        float startY = writer.getVerticalPosition(true);
        float chartHeight = 100f;

        Paragraph spacer = new Paragraph();
        spacer.setSpacingBefore(chartHeight);
        doc.add(spacer);

        PdfContentByte cb = writer.getDirectContent();
        float cx = doc.getPageSize().getWidth() / 2f - 60f;
        float cy = startY - 50f;
        float radius = 40f;

        // Arco gordura (vermelho)
        float gorduraAngle = (float) (gordura / 100.0 * 360.0);
        cb.saveState();
        cb.setColorFill(PIE_FAT);
        cb.moveTo(cx, cy);
        cb.arc(cx - radius, cy - radius, cx + radius, cy + radius, 90f, -gorduraAngle);
        cb.lineTo(cx, cy);
        cb.closePath();
        cb.fill();

        // Arco massa magra (azul)
        cb.setColorFill(PIE_LEAN);
        cb.moveTo(cx, cy);
        cb.arc(cx - radius, cy - radius, cx + radius, cy + radius, 90f - gorduraAngle, -(360f - gorduraAngle));
        cb.lineTo(cx, cy);
        cb.closePath();
        cb.fill();
        cb.restoreState();

        // Labels do gráfico
        ColumnText ct = new ColumnText(cb);
        float labelX = cx + radius + 20f;

        // Legenda gordura
        cb.saveState();
        cb.setColorFill(PIE_FAT);
        cb.rectangle(labelX, cy + 15f, 10f, 10f);
        cb.fill();
        cb.restoreState();

        ct.setSimpleColumn(labelX + 14f, cy + 10f, labelX + 180f, cy + 30f);
        ct.addElement(new Phrase("Gordura: " + format(gordura) + "%",
                new Font(Font.HELVETICA, 9, Font.BOLD, PIE_FAT)));
        ct.go();

        // Legenda massa magra
        cb.saveState();
        cb.setColorFill(PIE_LEAN);
        cb.rectangle(labelX, cy - 5f, 10f, 10f);
        cb.fill();
        cb.restoreState();

        ct = new ColumnText(cb);
        ct.setSimpleColumn(labelX + 14f, cy - 10f, labelX + 180f, cy + 10f);
        ct.addElement(new Phrase("Massa Magra: " + format(magra) + "%",
                new Font(Font.HELVETICA, 9, Font.BOLD, PIE_LEAN)));
        ct.go();
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

    private void addCircunferenciasTable(Document doc, DataCircleModel c) throws DocumentException {
        addSectionTitle(doc, "Circunferências (Detalhado)");

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

        Color EVOLUCAO_MELHORA = new Color(220, 245, 220);   // verde claro
        Color EVOLUCAO_PIORA = new Color(255, 225, 225);      // vermelho claro

        for (int i = 0; i < historicos.size(); i++) {
            AnthropometricDataModel a = historicos.get(i).getAnthropometricDataModel();
            AnthropometricDataModel prev = i > 0 ? historicos.get(i - 1).getAnthropometricDataModel() : null;

            String data = historicos.get(i).getDataConsulta() != null
                    ? historicos.get(i).getDataConsulta().format(DATE_FMT) : "-";
            addCenteredCell(table, data);

            // Peso — menor é melhor (simplificação)
            addEvolucaoCell(table, a, prev,
                    x -> x.getPeso(), true, EVOLUCAO_MELHORA, EVOLUCAO_PIORA);
            // IMC — menor é melhor
            addEvolucaoCell(table, a, prev,
                    x -> x.getImc(), true, EVOLUCAO_MELHORA, EVOLUCAO_PIORA);
            // Gordura — menor é melhor
            addEvolucaoCell(table, a, prev,
                    x -> x.getPorcentagemGordura(), true, EVOLUCAO_MELHORA, EVOLUCAO_PIORA);
            // Massa muscular — maior é melhor
            addEvolucaoCell(table, a, prev,
                    x -> x.getMassaMuscular(), false, EVOLUCAO_MELHORA, EVOLUCAO_PIORA);
            // Gordura visceral — menor é melhor
            addEvolucaoCell(table, a, prev,
                    x -> x.getGorduraVisceral(), true, EVOLUCAO_MELHORA, EVOLUCAO_PIORA);
        }

        doc.add(table);
    }

    @FunctionalInterface
    private interface ValueExtractor {
        Double extract(AnthropometricDataModel a);
    }

    private void addEvolucaoCell(PdfPTable table, AnthropometricDataModel current,
                                  AnthropometricDataModel prev, ValueExtractor extractor,
                                  boolean lowerIsBetter, Color melhora, Color piora) {
        Double val = current != null ? extractor.extract(current) : null;
        Double prevVal = prev != null ? extractor.extract(prev) : null;
        String text = val != null ? format(val) : "-";

        PdfPCell cell = new PdfPCell(new Phrase(text, SMALL_FONT));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5f);
        cell.setBorder(PdfPCell.BOTTOM);
        cell.setBorderColor(new Color(230, 230, 230));

        if (val != null && prevVal != null) {
            double diff = val - prevVal;
            if (Math.abs(diff) > 0.01) {
                boolean improved = lowerIsBetter ? diff < 0 : diff > 0;
                cell.setBackgroundColor(improved ? melhora : piora);
            }
        }

        table.addCell(cell);
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

    // === Helpers de tabela ===

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

    private String statusIcon(String classification) {
        if (classification == null) return "";
        return switch (classification) {
            case "Eutrofia", "Normal" -> "\u2713";          // ✓
            case "Magreza", "Abaixo do normal", "Sobrepeso",
                 "Alto" -> "\u26A0";                         // ⚠
            case "Acima do normal", "Muito Alto",
                 "Obesidade Grau I", "Obesidade Grau II",
                 "Obesidade Grau III" -> "\u2717";           // ✗
            default -> "";
        };
    }

    private String format(Double d) {
        return String.format("%.1f", d != null ? d : 0.0);
    }

    private String safe(String s) {
        return s != null ? s : "-";
    }
}
