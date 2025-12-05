package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.List;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;


@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository repository;
    private final PatientRepository patientRepository;

    public MealResponseDTO save(MealRequestDTO dto) {

        PatientModel patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        MealModel meal = new MealModel();
        meal.setHorario(dto.getHorario());
        meal.setDescricao(dto.getDescricao());
        meal.setAlimento(dto.getAlimento());
        meal.setQuantidade(dto.getQuantidade());
        meal.setUnidade(dto.getUnidade());
        meal.setObservacao(dto.getObservacao());
        meal.setPatient(patient);

        repository.save(meal);

        return toResponse(meal);
    }

    public List<MealResponseDTO> getMealsByPatient(Integer patientId) {
        return repository.findByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MealResponseDTO toResponse(MealModel m) {
        MealResponseDTO dto = new MealResponseDTO();
        dto.setId(m.getId());
        dto.setHorario(m.getHorario());
        dto.setDescricao(m.getDescricao());
        dto.setAlimento(m.getAlimento());
        dto.setQuantidade(m.getQuantidade());
        dto.setUnidade(m.getUnidade());
        dto.setObservacao(m.getObservacao());
        return dto;
    }


    public byte[] generateDietPdf(Integer patientId) throws Exception {

        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        List<MealModel> meals = repository.findByPatientId(patientId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, out);

        doc.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(0, 102, 0));
        Paragraph title = new Paragraph("Dieta de " + patient.getNome(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20f);
        doc.add(title);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        Font headFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
        Color headerBg = new Color(0, 153, 0);
        String[] headers = {"Horário", "Descrição", "Alimento", "Quantidade", "Unidade", "Observação"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headFont));
            cell.setBackgroundColor(headerBg);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5f);
            table.addCell(cell);
        }

        Color rowColor1 = Color.WHITE;
        Color rowColor2 = new Color(204, 255, 204);
        boolean alternate = false;

        for (MealModel m : meals) {
            Color bg = alternate ? rowColor2 : rowColor1;
            alternate = !alternate;

            PdfPCell c1 = new PdfPCell(new Phrase(m.getHorario()));
            PdfPCell c2 = new PdfPCell(new Phrase(m.getDescricao()));
            PdfPCell c3 = new PdfPCell(new Phrase(m.getAlimento()));
            PdfPCell c4 = new PdfPCell(new Phrase(m.getQuantidade().toString()));
            PdfPCell c5 = new PdfPCell(new Phrase(m.getUnidade()));
            PdfPCell c6 = new PdfPCell(new Phrase(m.getObservacao()));

            for (PdfPCell cell : new PdfPCell[]{c1, c2, c3, c4, c5, c6}) {
                cell.setBackgroundColor(bg);
                cell.setPadding(5f);
            }

            c1.setHorizontalAlignment(Element.ALIGN_CENTER);
            c4.setHorizontalAlignment(Element.ALIGN_CENTER);
            c5.setHorizontalAlignment(Element.ALIGN_CENTER);

            table.addCell(c1);
            table.addCell(c2);
            table.addCell(c3);
            table.addCell(c4);
            table.addCell(c5);
            table.addCell(c6);
        }

        doc.add(table);
        doc.close();

        return out.toByteArray();
    }




}

