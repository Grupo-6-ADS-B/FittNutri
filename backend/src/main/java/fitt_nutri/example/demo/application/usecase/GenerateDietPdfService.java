package fitt_nutri.example.demo.application.usecase;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import fitt_nutri.example.demo.domain.port.in.GenerateDietPdfUseCase;
import fitt_nutri.example.demo.domain.port.out.MealRepositoryPort;
import fitt_nutri.example.demo.domain.port.out.PatientRepositoryPort;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.service.FoodItensService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GenerateDietPdfService implements GenerateDietPdfUseCase {

    private final PatientRepositoryPort patientPort;
    private final MealRepositoryPort mealPort;
    private final FoodItensService foodItensService;

    @Override
    @Transactional(readOnly = true)
    public byte[] execute(Integer patientId) throws Exception {
        PatientModel patient = patientPort.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        List<MealModel> meals = mealPort.findByPatientId(patientId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(0, 0, 0));
        Font sectionTitleFont = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(0, 0, 0));
        Font textFont = new Font(Font.HELVETICA, 11);
        Font observationFont = new Font(Font.HELVETICA, 10, Font.ITALIC, new Color(90, 90, 90));

        Paragraph title = new Paragraph("PLANO ALIMENTAR", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(18f);
        doc.add(title);

        Paragraph name = new Paragraph("Paciente: " + patient.getNome(), textFont);
        name.setSpacingAfter(20f);
        doc.add(name);

        for (MealModel meal : meals) {

            com.lowagie.text.pdf.draw.LineSeparator separator = new com.lowagie.text.pdf.draw.LineSeparator();
            separator.setLineColor(new Color(210, 210, 210));
            doc.add(separator);

            Paragraph topSpacing = new Paragraph("");
            topSpacing.setSpacingBefore(12f);
            doc.add(topSpacing);

            PdfPTable mealTable = new PdfPTable(new float[]{4f, 1.4f, 1.2f});
            mealTable.setWidthPercentage(100);

            String cabecalho = (meal.getHorario() != null ? meal.getHorario() + " - " : "") + meal.getDescricao();
            PdfPCell header = new PdfPCell(new Phrase(cabecalho, sectionTitleFont));
            header.setBorder(PdfPCell.NO_BORDER);
            header.setBackgroundColor(new Color(220, 245, 220));
            header.setPadding(8f);
            header.setColspan(3);
            mealTable.setSpacingBefore(6f);
            header.setPaddingBottom(10f);
            mealTable.addCell(header);

            addHeaderCell(mealTable, "Alimento");
            addHeaderCell(mealTable, "Qtd.");
            addHeaderCell(mealTable, "Unid.");

            for (var item : meal.getAlimentos()) {
                addValueCell(mealTable, item.getAlimento());
                addCenteredValueCell(mealTable,
                        item.getQuantidade() != null ? item.getQuantidade().toString() : "");
                addCenteredValueCell(mealTable, item.getUnidade());
            }

            Paragraph extraSpace = new Paragraph(" ");
            extraSpace.setSpacingAfter(14f);
            doc.add(extraSpace);

            doc.add(mealTable);

            MacrosDTO macros = getTotalMacrosFromMeal(meal);

            Paragraph macroSpacing = new Paragraph("");
            macroSpacing.setSpacingBefore(8f);
            doc.add(macroSpacing);

            PdfPTable macrosTable = new PdfPTable(new float[]{2.2f, 1f, 1f, 1f, 1f, 1f});
            macrosTable.setWidthPercentage(100);
            macrosTable.setSpacingAfter(10f);

            addHeaderCell(macrosTable, "Macros");
            addHeaderCell(macrosTable, "Kcal");
            addHeaderCell(macrosTable, "Prot.");
            addHeaderCell(macrosTable, "Carb.");
            addHeaderCell(macrosTable, "Gord.");
            addHeaderCell(macrosTable, "Fibra");

            addValueCell(macrosTable, "");
            addCenteredValueCell(macrosTable, format(macros.kcal()));
            addCenteredValueCell(macrosTable, format(macros.proteina()));
            addCenteredValueCell(macrosTable, format(macros.carboidrato()));
            addCenteredValueCell(macrosTable, format(macros.lipideos()));
            addCenteredValueCell(macrosTable, format(macros.fibra()));

            doc.add(macrosTable);

            if (meal.getObservacao() != null && !meal.getObservacao().isBlank()) {
                Paragraph obs = new Paragraph("Observação: " + meal.getObservacao(), observationFont);
                obs.setIndentationLeft(8f);
                obs.setSpacingAfter(20f);
                doc.add(obs);
            }
        }

        doc.close();
        return out.toByteArray();
    }

    private MacrosDTO getTotalMacrosFromMeal(MealModel meal) {
        double proteina = 0, carbo = 0, gordura = 0, fibra = 0, kcal = 0;

        for (var item : meal.getAlimentos()) {
            try {
                MacrosDTO m = foodItensService.getMacrosByNome(
                        item.getAlimento(),
                        item.getQuantidade()
                );
                proteina += m.proteina();
                carbo += m.carboidrato();
                gordura += m.lipideos();
                fibra += m.fibra();
                kcal += foodItensService.getCaloriasByNomeAndGramas(item.getAlimento(), item.getQuantidade());
            } catch (Exception e) {
                // manter comportamento tolerante
            }
        }

        return new MacrosDTO(round(proteina), round(carbo), round(gordura), round(fibra), round(kcal));
    }

    private String format(Double d) {
        return String.format("%.1f", d != null ? d : 0.0);
    }

    private double round(Double d) {
        return Math.round(d * 10.0) / 10.0;
    }

    private void addHeaderCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt, new Font(Font.HELVETICA, 10, Font.BOLD, new Color(0, 0, 0))));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBackgroundColor(new Color(232, 255, 232));
        c.setPadding(6f);
        t.addCell(c);
    }

    private void addValueCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt != null ? txt : "", new Font(Font.HELVETICA, 10)));
        c.setBorder(PdfPCell.NO_BORDER);
        c.setPadding(4f);
        t.addCell(c);
    }

    private void addCenteredValueCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt != null ? txt : "", new Font(Font.HELVETICA, 10)));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBorder(PdfPCell.NO_BORDER);
        c.setPadding(4f);
        t.addCell(c);
    }
}