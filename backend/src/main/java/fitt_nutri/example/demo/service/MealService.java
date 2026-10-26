package fitt_nutri.example.demo.service;

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
import fitt_nutri.example.demo.model.PatientHistoryModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.MealRepository;
import fitt_nutri.example.demo.repository.PatientHistoryRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository repository;
    private final PatientRepository patientRepository;
    private final PatientHistoryRepository patientHistoryRepository;
    private final FoodItensService foodItensService;
    private final FoodItensRepository foodItensRepository;
    private final DietPdfService dietPdfService;

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

    public MealResponseDTO updateMealFromDto(Integer mealId, MealRequestDTO dto) {
        MealModel existingMeal = repository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Refeição não encontrada"));
        verificarPropriedadeRefeicao(existingMeal);

        existingMeal.setDescricao(dto.getDescricao());
        existingMeal.setHorario(dto.getHorario());
        existingMeal.setObservacao(dto.getObservacao());

        existingMeal.getAlimentos().clear();
        if (dto.getAlimentos() != null) {
            List<MealItemModel> itens = dto.getAlimentos().stream()
                    .map(itemDto -> buildMealItem(itemDto, existingMeal))
                    .collect(Collectors.toList());
            existingMeal.setAlimentos(itens);
        }

        return toMealResponseDTO(repository.save(existingMeal));
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
     * Retorna macros de um item de refeição (zeros quando não há valor).
     * Para saber se o valor existe de verdade, use {@link #macrosDoItem(MealItemModel)}.
     */
    public MacrosDTO getMacrosFromMealItem(MealItemModel item) {
        return macrosDoItem(item).orElse(new MacrosDTO(0.0, 0.0, 0.0, 0.0, 0.0));
    }

    /**
     * Macros de um item de refeição, ou vazio se não for possível calcular.
     * Prioridade 1: snapshot gravado no banco (preciso e imutável).
     * Prioridade 2: busca pelo nome do alimento (itens antigos ou sem foodItemId), preferindo o
     * nome idêntico ao nome que só "contém" o texto.
     * "Vazio" significa "sem valor": o PDF mostra "—" em vez de um zero que enganaria.
     */
    public Optional<MacrosDTO> macrosDoItem(MealItemModel item) {
        if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
            return Optional.empty();
        }

        if (item.getSnapshotKcal() != null) {
            return Optional.of(new MacrosDTO(
                    round(safe(item.getSnapshotProteina())),
                    round(safe(item.getSnapshotCarboidrato())),
                    round(safe(item.getSnapshotLipideos())),
                    round(safe(item.getSnapshotFibra())),
                    round(safe(item.getSnapshotKcal()))
            ));
        }

        // Fallback para itens criados antes dos snapshots ou sem foodItemId
        String nome = item.getAlimento() == null ? "" : item.getAlimento().trim();
        if (nome.isEmpty()) {
            return Optional.empty();
        }
        List<FoodItensModel> matches = foodItensRepository.findByNomeContainingIgnoreCase(nome);
        if (matches.isEmpty()) {
            log.warn("Alimento não encontrado na base: '{}'", item.getAlimento());
            return Optional.empty();
        }
        FoodItensModel food = matches.stream()
                .filter(f -> f.getNome() != null && f.getNome().trim().equalsIgnoreCase(nome))
                .findFirst()
                .orElse(matches.get(0));
        if (food.getEnergiaKcal() == null) {
            return Optional.empty(); // a tabela de origem não tem valor para este alimento
        }
        Double q = item.getQuantidade();
        return Optional.of(new MacrosDTO(
                round(safe(food.getProteina()) * q),
                round(safe(food.getCarboidrato()) * q),
                round(safe(food.getLipideos()) * q),
                round(safe(food.getFibra()) * q),
                round(safe(food.getEnergiaKcal()) * q)
        ));
    }

    // -------------------------------------------------------------------------
    // Geração de PDF
    // -------------------------------------------------------------------------

    /** Monta os dados do paciente e entrega ao {@link DietPdfService}, que desenha o PDF. */
    @Transactional
    public byte[] generateDietPdf(Integer patientId) throws Exception {
        PatientModel patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        List<MealModel> meals = repository.findByPatientId(patientId);

        PatientHistoryModel latestHistory =
                patientHistoryRepository.findTopByPatientModelIdOrderByDataConsultaDesc(patientId);

        LocalDate dataConsulta = latestHistory != null ? latestHistory.getDataConsulta() : null;

        String motivoConsulta = null;
        if (latestHistory != null
                && latestHistory.getMotivoConsulta() != null
                && !latestHistory.getMotivoConsulta().isBlank()) {
            motivoConsulta = latestHistory.getMotivoConsulta();
        } else if (patient.getMotivoConsulta() != null && !patient.getMotivoConsulta().isBlank()) {
            motivoConsulta = patient.getMotivoConsulta();
        }

        UserModel nutricionista = patient.getNutricionista();
        return dietPdfService.gerar(new DietPdfService.Dados(
                patient.getNome(),
                nutricionista != null ? nutricionista.getNome() : null,
                nutricionista != null ? nutricionista.getCrn() : null,
                dataConsulta,
                motivoConsulta,
                LocalDate.now(),
                meals,
                this::macrosDoItem));
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
        if (quantidade == null || quantidade <= 0 || food.getEnergiaKcal() == null) return;
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
}
