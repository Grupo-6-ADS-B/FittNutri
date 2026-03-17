package fitt_nutri.example.demo.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.transaction.annotation.Transactional;
import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealItemDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.response.MealItemResponseDTO;
import fitt_nutri.example.demo.dto.response.MealResponseDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPCell;

@Slf4j
@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository repository;
    private final PatientRepository patientRepository;
    private final FoodItensService foodItensService;
    private final FoodItensRepository foodItensRepository;

    // -------------------------------------------------------------------------
    // Verificações de propriedade (multi-tenant)
    // -------------------------------------------------------------------------

    private void verificarPropriedadePaciente(PatientModel patient) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (patient.getNutricionista() == null ||
                !emailLogado.equals(patient.getNutricionista().getEmail())) {
            throw new AccessDeniedException(
                    "Acesso negado: este paciente não pertence ao nutricionista logado");
        }
    }

    private void verificarPropriedadeRefeicao(MealModel meal) {
        verificarPropriedadePaciente(meal.getPatient());
    }

    // -------------------------------------------------------------------------
    // CRUD de refeições
    // -------------------------------------------------------------------------

    public MealResponseDTO addMealFromDto(Integer patientId, MealRequestDTO dto) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        MealModel meal = new MealModel();
        meal.setDescricao(dto.getDescricao());
        meal.setHorario(dto.getHorario());
        meal.setObservacao(dto.getObservacao());
        meal.setPatient(patient);

        List<MealItemModel> itens = dto.getAlimentos().stream()
                .map(itemDto -> buildMealItem(itemDto, meal))
                .collect(Collectors.toList());
        meal.setAlimentos(itens);

        return toMealResponseDTO(repository.save(meal));
    }

    public List<MealModel> getAllMealsByPatient(Integer patientId) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);
        return repository.findByPatient(patient);
    }

    @Transactional
    public List<MealResponseDTO> saveFullDiet(Integer patientId, FullDietRequestDTO request) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        repository.deleteAll(repository.findByPatient(patient));

        return request.getRefeicoes().stream().map(dto -> {
            MealModel meal = new MealModel();
            meal.setDescricao(dto.getDescricao());
            meal.setHorario(dto.getHorario());
            meal.setObservacao(dto.getObservacao());
            meal.setPatient(patient);

            List<MealItemModel> itens = dto.getAlimentos().stream()
                    .map(itemDto -> buildMealItem(itemDto, meal))
                    .collect(Collectors.toList());
            meal.setAlimentos(itens);

            return toMealResponseDTO(repository.save(meal));
        }).collect(Collectors.toList());
    }

    public MealModel updateMeal(Integer mealId, MealModel updatedMeal) {
        MealModel existingMeal = repository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));
        verificarPropriedadeRefeicao(existingMeal);

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
        verificarPropriedadeRefeicao(existingMeal);

        if (mealPatch.getHorario() != null) existingMeal.setHorario(mealPatch.getHorario());
        if (mealPatch.getDescricao() != null) existingMeal.setDescricao(mealPatch.getDescricao());
        if (mealPatch.getObservacao() != null) existingMeal.setObservacao(mealPatch.getObservacao());

        return repository.save(existingMeal);
    }

    public void deleteMeal(Integer mealId) {
        MealModel meal = repository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));
        verificarPropriedadeRefeicao(meal);
        meal.setDeletedAt(java.time.LocalDateTime.now());
        repository.save(meal);
    }

    // -------------------------------------------------------------------------
    // Cálculo de macros
    // -------------------------------------------------------------------------

    public MacrosDTO getTotalMacrosFromMeal(MealModel meal) {
        double proteina = 0, carbo = 0, gordura = 0, fibra = 0, kcal = 0;
        for (MealItemModel item : meal.getAlimentos()) {
            MacrosDTO m = getMacrosFromMealItem(item);
            proteina += m.proteina();
            carbo    += m.carboidrato();
            gordura  += m.lipideos();
            fibra    += m.fibra();
            kcal     += m.kcal();
        }
        return new MacrosDTO(round(proteina), round(carbo), round(gordura), round(fibra), round(kcal));
    }

    /**
     * Retorna macros de um item de refeição.
     * Prioridade 1: snapshot gravado no banco (preciso e imutável).
     * Prioridade 2: fallback por busca de nome (itens antigos sem snapshot).
     */
    public MacrosDTO getMacrosFromMealItem(MealItemModel item) {
        if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
            return new MacrosDTO(0.0, 0.0, 0.0, 0.0, 0.0);
        }

        if (item.getSnapshotKcal() != null) {
            return new MacrosDTO(
                    round(safe(item.getSnapshotProteina())),
                    round(safe(item.getSnapshotCarboidrato())),
                    round(safe(item.getSnapshotLipideos())),
                    round(safe(item.getSnapshotFibra())),
                    round(safe(item.getSnapshotKcal()))
            );
        }

        // Fallback para itens criados antes dos snapshots
        List<FoodItensModel> matches = foodItensRepository
                .findByNomeContainingIgnoreCase(item.getAlimento());
        if (matches.isEmpty()) {
            log.warn("Alimento não encontrado na base: '{}'", item.getAlimento());
            return new MacrosDTO(0.0, 0.0, 0.0, 0.0, 0.0);
        }
        FoodItensModel food = matches.get(0);
        Double q = item.getQuantidade();
        return new MacrosDTO(
                round(safe(food.getProteina()) * q),
                round(safe(food.getCarboidrato()) * q),
                round(safe(food.getLipideos()) * q),
                round(safe(food.getFibra()) * q),
                round(safe(food.getEnergiaKcal()) * q)
        );
    }

    // -------------------------------------------------------------------------
    // Geração de PDF
    // -------------------------------------------------------------------------

    @Transactional
    public byte[] generateDietPdf(Integer patientId) throws Exception {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        List<MealModel> meals = repository.findByPatientId(patientId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font titleFont        = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(0, 0, 0));
        Font sectionTitleFont = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(0, 0, 0));
        Font textFont         = new Font(Font.HELVETICA, 11);
        Font observationFont  = new Font(Font.HELVETICA, 10, Font.ITALIC, new Color(90, 90, 90));

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

            String cabecalho = (meal.getHorario() != null ? meal.getHorario() + " - " : "")
                    + meal.getDescricao();
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

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    /**
     * Constrói um MealItemModel a partir do DTO.
     * Se foodItemId estiver presente, vincula FoodItensModel e captura snapshots escalados.
     */
    private MealItemModel buildMealItem(MealItemDTO itemDto, MealModel meal) {
        MealItemModel item = new MealItemModel();
        item.setAlimento(itemDto.getAlimento());
        item.setQuantidade(itemDto.getQuantidade());
        item.setUnidade(itemDto.getUnidade());
        item.setMeal(meal);

        if (itemDto.getFoodItemId() != null) {
            foodItensRepository.findById(itemDto.getFoodItemId()).ifPresentOrElse(
                    food -> {
                        item.setFoodItem(food);
                        capturarSnapshots(item, food, itemDto.getQuantidade());
                        if (item.getAlimento() == null || item.getAlimento().isBlank()) {
                            item.setAlimento(food.getNome());
                        }
                    },
                    () -> log.warn("foodItemId={} não encontrado; item salvo sem snapshot",
                            itemDto.getFoodItemId())
            );
        }

        return item;
    }

    /** Calcula e persiste os macros escalados pela quantidade como snapshot. */
    private void capturarSnapshots(MealItemModel item, FoodItensModel food, Double quantidade) {
        if (quantidade == null || quantidade <= 0) return;
        item.setSnapshotKcal(round(safe(food.getEnergiaKcal()) * quantidade));
        item.setSnapshotProteina(round(safe(food.getProteina()) * quantidade));
        item.setSnapshotCarboidrato(round(safe(food.getCarboidrato()) * quantidade));
        item.setSnapshotLipideos(round(safe(food.getLipideos()) * quantidade));
        item.setSnapshotFibra(round(safe(food.getFibra()) * quantidade));
    }

    /** Converte MealModel → MealResponseDTO expondo snapshots de cada item. */
    public MealResponseDTO toMealResponseDTO(MealModel meal) {
        MealResponseDTO dto = new MealResponseDTO();
        dto.setId(meal.getId());
        dto.setHorario(meal.getHorario());
        dto.setDescricao(meal.getDescricao());
        dto.setObservacao(meal.getObservacao());
        dto.setAlimentos(
                meal.getAlimentos().stream()
                        .map(this::toMealItemResponseDTO)
                        .collect(Collectors.toList())
        );
        return dto;
    }

    private MealItemResponseDTO toMealItemResponseDTO(MealItemModel item) {
        MealItemResponseDTO i = new MealItemResponseDTO();
        i.setId(item.getId());
        i.setAlimento(item.getAlimento());
        i.setQuantidade(item.getQuantidade());
        i.setUnidade(item.getUnidade());
        i.setSnapshotKcal(item.getSnapshotKcal());
        i.setSnapshotProteina(item.getSnapshotProteina());
        i.setSnapshotCarboidrato(item.getSnapshotCarboidrato());
        i.setSnapshotLipideos(item.getSnapshotLipideos());
        i.setSnapshotFibra(item.getSnapshotFibra());
        return i;
    }

    private double round(Double d) {
        return Math.round((d != null ? d : 0.0) * 10.0) / 10.0;
    }

    private double safe(Double value) {
        return value != null ? value : 0.0;
    }

    private String format(Double d) {
        return String.format("%.1f", d != null ? d : 0.0);
    }

    private void addHeaderCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(
                new Phrase(txt, new Font(Font.HELVETICA, 10, Font.BOLD, new Color(0, 0, 0))));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBackgroundColor(new Color(232, 255, 232));
        c.setPadding(6f);
        t.addCell(c);
    }

    private void addValueCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(
                new Phrase(txt != null ? txt : "", new Font(Font.HELVETICA, 10)));
        c.setBorder(PdfPCell.NO_BORDER);
        c.setPadding(4f);
        t.addCell(c);
    }

    private void addCenteredValueCell(PdfPTable t, String txt) {
        PdfPCell c = new PdfPCell(
                new Phrase(txt != null ? txt : "", new Font(Font.HELVETICA, 10)));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBorder(PdfPCell.NO_BORDER);
        c.setPadding(4f);
        t.addCell(c);
    }
}
