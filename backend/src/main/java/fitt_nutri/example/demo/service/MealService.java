package fitt_nutri.example.demo.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.transaction.annotation.Transactional;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.request.MealItemDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientHistoryModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPCell;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository repository;
    private final PatientRepository patientRepository;
    private final PatientHistoryRepository patientHistoryRepository;
    private final FoodItensService foodItensService;
    private final FoodItensRepository foodItensRepository;

    public MealModel addMealFromDto(Integer patientId, MealRequestDTO dto) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        MealModel meal = new MealModel();
        meal.setDescricao(dto.getDescricao());
        meal.setHorario(dto.getHorario());
        meal.setObservacao(dto.getObservacao());
        meal.setPatient(patient);

        List<MealItemModel> itens = dto.getAlimentos().stream().map(itemDto -> {
            MealItemModel item = new MealItemModel();
            item.setAlimento(itemDto.getAlimento());
            item.setQuantidade(itemDto.getQuantidade());
            item.setUnidade(itemDto.getUnidade());
            item.setMeal(meal);
            return item;
        }).collect(Collectors.toList());

        meal.setAlimentos(itens);

        return repository.save(meal);
    }

    public List<MealModel> getAllMealsByPatient(Integer patientId) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        return repository.findByPatient(patient);
    }

    public List<MealModel> saveFullDiet(Integer patientId, FullDietRequestDTO request) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        List<MealModel> old = repository.findByPatient(patient);
        repository.deleteAll(old);

        List<MealModel> newMeals = request.getRefeicoes().stream().map(dto -> {
            MealModel meal = new MealModel();
            meal.setDescricao(dto.getDescricao());
            meal.setHorario(dto.getHorario());
            meal.setObservacao(dto.getObservacao());
            meal.setPatient(patient);

            List<MealItemModel> itens = dto.getAlimentos().stream().map(itemDto -> {
                MealItemModel item = new MealItemModel();
                item.setAlimento(itemDto.getAlimento());
                item.setQuantidade(itemDto.getQuantidade());
                item.setUnidade(itemDto.getUnidade());
                item.setMeal(meal);
                return item;
            }).collect(Collectors.toList());

            meal.setAlimentos(itens);

            return repository.save(meal);
        }).collect(Collectors.toList());

        return newMeals;
    }

    public MealModel updateMeal(Integer mealId, MealModel updatedMeal) {
        MealModel existingMeal = repository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));

        existingMeal.setDescricao(updatedMeal.getDescricao());
        existingMeal.setHorario(updatedMeal.getHorario());
        existingMeal.setObservacao(updatedMeal.getObservacao());

        existingMeal.getAlimentos().clear();
        if (updatedMeal.getAlimentos() != null) {
            updatedMeal.getAlimentos().forEach(item -> {
                item.setMeal(existingMeal);
                existingMeal.getAlimentos().add(item);
            });
        }

        return repository.save(existingMeal);
    }

    public MealModel patchMeal(Integer mealId, MealModel mealPatch) {
        MealModel existingMeal = repository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));

        if (mealPatch.getHorario() != null) existingMeal.setHorario(mealPatch.getHorario());
        if (mealPatch.getDescricao() != null) existingMeal.setDescricao(mealPatch.getDescricao());
        if (mealPatch.getObservacao() != null) existingMeal.setObservacao(mealPatch.getObservacao());

        return repository.save(existingMeal);
    }

    public void deleteMeal(Integer mealId) {
        MealModel meal = repository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));
        repository.delete(meal);
    }

    public MacrosDTO getTotalMacrosFromMeal(MealModel meal) {
        double proteina = 0, carbo = 0, gordura = 0, fibra = 0, kcal = 0;

        for (MealItemModel item : meal.getAlimentos()) {
            MacrosDTO m = getMacrosFromMealItem(item);

            proteina += m.proteina();
            carbo += m.carboidrato();
            gordura += m.lipideos();
            fibra += m.fibra();
            kcal += m.kcal();
        }

        return new MacrosDTO(
                round(proteina),
                round(carbo),
                round(gordura),
                round(fibra),
                round(kcal)
        );
    }


    public MacrosDTO calcularMacrosTotaisRefeicao(MealModel meal) {

        double totalProteina = 0.0;
        double totalCarbo = 0.0;
        double totalGordura = 0.0;
        double totalFibra = 0.0;
        double totalKcal = 0.0;

        for (MealItemModel item : meal.getAlimentos()) {
            try {
                MacrosDTO macros = foodItensService.getMacrosByNome(
                        item.getAlimento(),
                        item.getQuantidade()
                );

                totalProteina += macros.proteina();
                totalCarbo += macros.carboidrato();
                totalGordura += macros.lipideos();
                totalFibra += macros.fibra();

                totalKcal += foodItensService.getCaloriasByNomeAndGramas(
                        item.getAlimento(),
                        item.getQuantidade()
                );

            } catch (Exception e) {
                System.out.println("Erro ao calcular macros para " + item.getAlimento());
            }
        }

        return new MacrosDTO(
                round(totalProteina),
                round(totalCarbo),
                round(totalGordura),
                round(totalFibra),
                round(totalKcal)
        );
    }

    private double round(Double d) {
        return Math.round(d * 10.0) / 10.0;
    }

    private Double safe(Double value) {
        return value != null ? value : 0.0;
    }


    public MacrosDTO getMacrosFromMealItem(MealItemModel item) {
        if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
            return new MacrosDTO(0.0, 0.0, 0.0, 0.0, 0.0);
        }

        List<FoodItensModel> matches = foodItensRepository.findByNomeContainingIgnoreCase(item.getAlimento());

        if (matches.isEmpty()) {
            System.out.println("⚠ Alimento não encontrado: " + item.getAlimento());
            return new MacrosDTO(0.0, 0.0, 0.0, 0.0, 0.0);
        }

        FoodItensModel food = matches.get(0);

        Double q = item.getQuantidade(); // já está em gramas

        Double proteina = safe(food.getProteina()) * q;
        Double carbo = safe(food.getCarboidrato()) * q;
        Double gordura = safe(food.getLipideos()) * q;
        Double fibra = safe(food.getFibra()) * q;
        Double kcal = safe(food.getEnergiaKcal()) * q;

        return new MacrosDTO(
                round(proteina),
                round(carbo),
                round(gordura),
                round(fibra),
                round(kcal)
        );
    }


    @Transactional
    public byte[] generateDietPdf(Integer patientId) throws Exception {

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
        name.setSpacingAfter(8f);
        doc.add(name);

        PatientHistoryModel latestHistory =
                patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(patientId);

        String dataConsulta = "-";
        if (latestHistory != null && latestHistory.getDataConsulta() != null) {
            dataConsulta = latestHistory.getDataConsulta()
                    .minusDays(1)
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        String motivoConsulta = "-";
        if (latestHistory != null
                && latestHistory.getMotivoConsulta() != null
                && !latestHistory.getMotivoConsulta().isBlank()) {
            motivoConsulta = latestHistory.getMotivoConsulta();
        } else if (patient.getMotivoConsulta() != null && !patient.getMotivoConsulta().isBlank()) {
            motivoConsulta = patient.getMotivoConsulta();
        }

        Paragraph consultationDate = new Paragraph("Data da consulta: " + dataConsulta, textFont);
        consultationDate.setSpacingAfter(4f);
        doc.add(consultationDate);

        Paragraph consultationReason = new Paragraph("Motivo da consulta: " + motivoConsulta, textFont);
        consultationReason.setSpacingAfter(20f);
        doc.add(consultationReason);

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


    private String format(Double d) {
        return String.format("%.1f", d != null ? d : 0.0);
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
