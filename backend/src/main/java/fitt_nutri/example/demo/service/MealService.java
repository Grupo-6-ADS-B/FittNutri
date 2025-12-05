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

        List<MealModel> meals = repository.findByPatientId(patientId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Criação do documento
        Document doc = new Document();
        PdfWriter.getInstance(doc, out);

        doc.open();
        doc.add(new Paragraph("Dieta do Paciente - 1 Dia"));
        doc.add(new Paragraph(" "));

        // Criando a tabela
        PdfPTable table = new PdfPTable(6); // 6 colunas
        table.addCell("Horário");
        table.addCell("Descrição");
        table.addCell("Alimento");
        table.addCell("Quantidade");
        table.addCell("Unidade");
        table.addCell("Observação");

        // Adicionando os dados das refeições
        for (MealModel m : meals) {
            table.addCell(m.getHorario());
            table.addCell(m.getDescricao());
            table.addCell(m.getAlimento());
            table.addCell(m.getQuantidade().toString());
            table.addCell(m.getUnidade());
            table.addCell(m.getObservacao());
        }

        doc.add(table);
        doc.close();

        return out.toByteArray();
    }




}

