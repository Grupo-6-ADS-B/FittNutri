package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.exceptions.DateNotFound;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DataCircleService {

    private final DataCircleRepository repository;
    private final PatientRepository patientRepository;

    private void verificarPropriedadePaciente(PatientModel patient) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        if (patient.getNutricionista() == null || !emailLogado.equals(patient.getNutricionista().getEmail())) {
            throw new AccessDeniedException("Acesso negado: este paciente não pertence ao nutricionista logado");
        }
    }

    /* -------------------- CREATE -------------------- */
    @Transactional
    public DataCircleModel cadastrar(DataCircleModel model) {
        if (model == null) throw new InvalidDataException("Dados não podem ser nulos");
        if (model.getIdDadosCircunferencia() != null)
            throw new InvalidDataException("ID deve ser nulo ao cadastrar um novo registro");

        if (model.getPaciente() == null || model.getPaciente().getId() == null)
            throw new InvalidDataException("Informe o paciente (paciente.id) para salvar o registro");

        // Carrega o paciente real do banco e verifica ownership
        PatientModel paciente = patientRepository.findById(model.getPaciente().getId())
                .orElseThrow(() -> new InvalidDataException("Paciente não encontrado"));
        verificarPropriedadePaciente(paciente);
        model.setPaciente(paciente);

        if (model.getPesoIdeal() != null && model.getPesoIdeal() < 0)
            throw new InvalidDataException("O peso não pode ser negativo");

        try {
            DataCircleModel saved = repository.save(model);
            repository.flush();
            return saved;
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidDataException("Falha de integridade: " + ex.getMostSpecificCause().getMessage());
        }
    }

    @Transactional
    public DataCircleModel cadastrarPorPaciente(Integer pacienteId, DataCircleModel model) {
        if (pacienteId == null || pacienteId <= 0)
            throw new InvalidDataException("ID de paciente inválido");
        if (model == null)
            throw new InvalidDataException("Dados não podem ser nulos");
        if (model.getIdDadosCircunferencia() != null)
            throw new InvalidDataException("ID deve ser nulo ao cadastrar um novo registro");

        PatientModel pacienteModel = patientRepository.findById(pacienteId)
                .orElseThrow(() -> new InvalidDataException("Paciente não encontrado"));
        verificarPropriedadePaciente(pacienteModel);

        if (model.getPesoIdeal() != null && model.getPesoIdeal() < 0)
            throw new InvalidDataException("O peso não pode ser negativo");

        model.setPaciente(pacienteModel);

        try {
            DataCircleModel saved = repository.save(model);
            repository.flush();
            return saved;
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidDataException("Falha de integridade: " + ex.getMostSpecificCause().getMessage());
        }
    }


    /* -------------------- READ -------------------- */
    public List<DataCircleModel> pegarTodos() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        List<DataCircleModel> list = repository.findAll().stream()
                .filter(d -> d.getPaciente() != null
                        && d.getPaciente().getNutricionista() != null
                        && emailLogado.equals(d.getPaciente().getNutricionista().getEmail()))
                .collect(Collectors.toList());
        if (list.isEmpty()) throw new DateNotFound("Nenhum dado encontrado");
        return list;
    }

    public DataCircleModel pegarPorId(Integer id) {
        if (id == null || id <= 0) throw new InvalidDataException("ID inválido");
        DataCircleModel model = repository.findById(id).orElseThrow(() -> new DateNotFound("ID não encontrado"));
        verificarPropriedadePaciente(model.getPaciente());
        return model;
    }

    /* -------------------- UPDATE (PUT) -------------------- */
    @Transactional
    public DataCircleModel atualizar(Integer id, DataCircleModel model) {
        if (id == null || id <= 0) throw new InvalidDataException("ID inválido");

        DataCircleModel existing = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));
        verificarPropriedadePaciente(existing.getPaciente());

        if (model == null) throw new InvalidDataException("Dados não podem ser nulos");

        // exige paciente
        if (model.getPaciente() == null || model.getPaciente().getId() == null)
            throw new InvalidDataException("Informe o paciente (paciente.id) para atualizar");

        Integer pacienteId = model.getPaciente().getId();

        if (model.getPesoIdeal() != null && model.getPesoIdeal() < 0)
            throw new InvalidDataException("O peso não pode ser negativo");

        model.setIdDadosCircunferencia(id);

        try {
            DataCircleModel updated = repository.save(model);
            repository.flush();
            return updated;
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidDataException("Falha de integridade: " + ex.getMostSpecificCause().getMessage());
        }
    }

    /* -------------------- PARTIAL UPDATE (PATCH) -------------------- */
    @Transactional
    public DataCircleModel atualizarParcial(Integer id, Map<String, Object> updates) {
        if (id == null || id <= 0) throw new InvalidDataException("ID inválido");

        DataCircleModel m = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));
        verificarPropriedadePaciente(m.getPaciente());

        if (updates == null || updates.isEmpty())
            throw new InvalidDataException("Nenhum dado para atualização fornecido.");

        updates.forEach((field, value) -> {
            switch (field) {

                case "abdominal"   -> m.setAbdominal(toDoubleSafe(value, "abdominal"));
                case "cintura"     -> m.setCintura(toDoubleSafe(value, "cintura"));
                case "quadril"     -> m.setQuadril(toDoubleSafe(value, "quadril"));
                case "pulso"       -> m.setPulso(toDoubleSafe(value, "pulso"));
                case "panturrilha" -> m.setPanturrilha(toDoubleSafe(value, "panturrilha"));
                case "braco"       -> m.setBraco(toDoubleSafe(value, "braco"));
                case "coxa"        -> m.setCoxa(toDoubleSafe(value, "coxa"));
                case "pesoIdeal"   -> {
                    Double d = toDoubleSafe(value, "pesoIdeal");
                    if (d < 0) throw new InvalidDataException("O peso ideal não pode ser negativo");
                    m.setPesoIdeal(d);
                }
                case "idDadosCircunferencia", "paciente" ->
                    // segurança: não permitir mudar ID nem relacionamento via PATCH cru
                        throw new InvalidDataException("Campo não permitido no PATCH: " + field);
                default -> {
                    // política: ignorar campos desconhecidos (ou lance erro, se preferir)
                }
            }
        });

        try {
            DataCircleModel saved = repository.save(m);
            repository.flush();
            return saved;
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidDataException("Falha de integridade: " + ex.getMostSpecificCause().getMessage());
        }
    }

    /* -------------------- DELETE -------------------- */
    @Transactional
    public void deletar(Integer id) {
        if (id == null || id <= 0) throw new InvalidDataException("ID inválido");
        DataCircleModel model = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("Registro não encontrado para exclusão"));
        verificarPropriedadePaciente(model.getPaciente());
        repository.deleteById(id);
    }

    /* -------------------- COUNT -------------------- */
    public long contarRegistros() {
        return repository.count();
    }

    /* -------------------- LIST BY PATIENT -------------------- */
    public List<DataCircleModel> listarPorPaciente(Integer pacienteId) {
        if (pacienteId == null || pacienteId <= 0)
            throw new InvalidDataException("ID de paciente inválido");

        PatientModel patient = patientRepository.findById(pacienteId)
                .orElseThrow(() -> new InvalidDataException("Paciente não encontrado"));
        verificarPropriedadePaciente(patient);

        List<DataCircleModel> list = repository.findByPaciente_Id(pacienteId);
        if (list.isEmpty()) throw new DateNotFound("Nenhum dado encontrado para este paciente");
        return list;
    }

    /* -------------------- HELPERS -------------------- */
    private Double toDoubleSafe(Object valor, String field) {
        if (valor == null) throw new InvalidDataException(field + " não pode ser nulo");
        if (valor instanceof Number n) return n.doubleValue();
        try {
            return Double.valueOf(String.valueOf(valor));
        } catch (NumberFormatException e) {
            throw new InvalidDataException("Valor inválido para " + field + ": " + valor);
        }
    }

    private boolean safeEquals(String a, String b) {
        return (a == null && b == null) || (a != null && a.equals(b));
    }
}
