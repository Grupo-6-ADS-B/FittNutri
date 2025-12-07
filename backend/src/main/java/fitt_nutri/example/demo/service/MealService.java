package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.request.FullDietRequestDTO;
import fitt_nutri.example.demo.dto.request.MealRequestDTO;
import fitt_nutri.example.demo.dto.request.MealItemDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.MealItemModel;
import fitt_nutri.example.demo.model.MealModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPCell;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository repository;
    private final PatientRepository patientRepository;

    // salva uma refeição (com itens) para um paciente
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

    // retorna todas as refeições de um paciente (MealModel com lista de MealItemModel)
    public List<MealModel> getAllMealsByPatient(Integer patientId) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        return repository.findByPatient(patient);
    }

    // salva a dieta completa: deleta antigas e salva novas (FullDietRequestDTO)
    public List<MealModel> saveFullDiet(Integer patientId, FullDietRequestDTO request) {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        // deleta as refeições antigas do paciente
        List<MealModel> old = repository.findByPatient(patient);
        repository.deleteAll(old);

        // salva as novas refeições
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

        // atualizar itens: vamos simplificar: remover todos e adicionar os novos (client envia MealModel com alimentos preenchidos)
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

        // patch de itens não será tratado automaticamente aqui (poderíamos implementar lógica mais complexa)
        return repository.save(existingMeal);
    }

    public void deleteMeal(Integer mealId) {
        MealModel meal = repository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));
        repository.delete(meal);
    }

    // Gera PDF considerando MealModel com lista de MealItemModel
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

        PdfPTable table = new PdfPTable(4); // horário, descrição, alimentos (lista), observação
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        Font headFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
        Color headerBg = new Color(0, 153, 0);
        String[] headers = {"Horário", "Descrição", "Alimentos", "Observação"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headFont));
            cell.setBackgroundColor(headerBg);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5f);
            table.addCell(cell);
        }

        Color rowColor1 = Color.WHITE;
        Color rowColor2 = new Color(240, 255, 240);
        boolean alternate = false;

        for (MealModel m : meals) {
            Color bg = alternate ? rowColor2 : rowColor1;
            alternate = !alternate;

            PdfPCell c1 = new PdfPCell(new Phrase(m.getHorario() == null ? "" : m.getHorario()));
            PdfPCell c2 = new PdfPCell(new Phrase(m.getDescricao() == null ? "" : m.getDescricao()));

            // concatena itens em uma única string
            String alimentosStr = m.getAlimentos().stream()
                    .map(it -> String.format("%s (%s %s)",
                            it.getAlimento(),
                            it.getQuantidade() == null ? "" : it.getQuantidade().toString(),
                            it.getUnidade() == null ? "" : it.getUnidade()))
                    .collect(Collectors.joining("\n"));

            PdfPCell c3 = new PdfPCell(new Phrase(alimentosStr));
            PdfPCell c4 = new PdfPCell(new Phrase(m.getObservacao() == null ? "" : m.getObservacao()));

            for (PdfPCell cell : new PdfPCell[]{c1, c2, c3, c4}) {
                cell.setBackgroundColor(bg);
                cell.setPadding(5f);
            }

            c1.setHorizontalAlignment(Element.ALIGN_CENTER);

            table.addCell(c1);
            table.addCell(c2);
            table.addCell(c3);
            table.addCell(c4);
        }

        doc.add(table);
        doc.close();

        return out.toByteArray();
    }
}
