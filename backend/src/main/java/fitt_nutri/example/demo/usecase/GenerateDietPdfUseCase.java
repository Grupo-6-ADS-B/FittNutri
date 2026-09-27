package fitt_nutri.example.demo.usecase;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import fitt_nutri.example.demo.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.lowagie.text.Document;
import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GenerateDietPdfUseCase {

    private final MealRepository repository;
    private final PatientRepository patientRepository;
    private final MealService mealService; // pra usar getTotalMacrosFromMeal

    public byte[] execute(Integer patientId) throws Exception {

        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        List<MealModel> meals = repository.findByPatientId(patientId);

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

            LineSeparator separator = new LineSeparator();
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

            for (MealItemModel item : meal.getAlimentos()) {
                addValueCell(mealTable, item.getAlimento());
                addCenteredValueCell(mealTable,
                        item.getQuantidade() != null ? item.getQuantidade().toString() : "");
                addCenteredValueCell(mealTable, item.getUnidade());
            }

            doc.add(mealTable);

            MacrosDTO macros = mealService.getTotalMacrosFromMeal(meal);

            PdfPTable macrosTable = new PdfPTable(new float[]{2.2f, 1f, 1f, 1f, 1f, 1f});
            macrosTable.setWidthPercentage(100);

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
                doc.add(obs);
            }
        }

        doc.close();
        return out.toByteArray();
    }


    private String format(Double d) {
        return String.format("%.1f", d != null ? d : 0.0);
    }

    private void addHeaderCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        t.addCell(c);
    }

    private void addValueCell(PdfPTable t, String txt) {
        t.addCell(txt != null ? txt : "");
    }

    private void addCenteredValueCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(new Phrase(txt != null ? txt : ""));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        t.addCell(c);
    }
}