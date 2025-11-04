package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.ConflictException;
import fitt_nutri.example.demo.exceptions.DateNotFound;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DataCircleService {

    private final DataCircleRepository repository;

    /* -------------------- CREATE -------------------- */
    @Transactional
    public DataCircleModel cadastrar(DataCircleModel model) {
        if (model == null) throw new InvalidDataException("Dados não podem ser nulos");
        if (model.getIdDadosCircunferencia() != null)
            throw new InvalidDataException("ID deve ser nulo ao cadastrar um novo registro");

        // exige paciente (FK)
        if (model.getPaciente() == null || model.getPaciente().getId() == null)
            throw new InvalidDataException("Informe o paciente (paciente.id) para salvar o registro");

        // conflito de rótulo POR paciente (coerente com unique(rotulo, idUsuarioFK))
        Integer pacienteId = model.getPaciente().getId();
        if (repository.existsByRotuloAndPaciente_Id(model.getRotulo(), pacienteId))
            throw new ConflictException("Já existe um registro com rótulo '" + model.getRotulo() + "' para este paciente.");

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

    /* -------------------- READ -------------------- */
    public List<DataCircleModel> pegarTodos() {
        List<DataCircleModel> list = repository.findAll();
        if (list.isEmpty()) throw new DateNotFound("Nenhum dado encontrado");
        return list;
    }

    public DataCircleModel pegarPorId(Integer id) {
        if (id == null || id <= 0) throw new InvalidDataException("ID inválido");
        return repository.findById(id).orElseThrow(() -> new DateNotFound("ID não encontrado"));
    }

    /* -------------------- UPDATE (PUT) -------------------- */
    @Transactional
    public DataCircleModel atualizar(Integer id, DataCircleModel model) {
        if (id == null || id <= 0) throw new InvalidDataException("ID inválido");

        DataCircleModel existing = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));

        if (model == null) throw new InvalidDataException("Dados não podem ser nulos");

        // exige paciente
        if (model.getPaciente() == null || model.getPaciente().getId() == null)
            throw new InvalidDataException("Informe o paciente (paciente.id) para atualizar");

        Integer pacienteId = model.getPaciente().getId();
        if (!safeEquals(existing.getRotulo(), model.getRotulo())
                && repository.existsByRotuloAndPaciente_Id(model.getRotulo(), pacienteId))
            throw new ConflictException("O rótulo '" + model.getRotulo() + "' já existe para este paciente.");

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

        if (updates == null || updates.isEmpty())
            throw new InvalidDataException("Nenhum dado para atualização fornecido.");

        updates.forEach((field, value) -> {
            switch (field) {
                case "rotulo" -> {
                    String novo = String.valueOf(value);
                    Integer pacienteId = (m.getPaciente() != null ? m.getPaciente().getId() : null);
                    if (pacienteId == null) throw new InvalidDataException("Registro sem paciente associado");
                    if (!safeEquals(novo, m.getRotulo())
                            && repository.existsByRotuloAndPaciente_Id(novo, pacienteId))
                        throw new ConflictException("O rótulo '" + novo + "' já existe para este paciente.");
                    m.setRotulo(novo);
                }
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
        if (!repository.existsById(id)) throw new DateNotFound("Registro não encontrado para exclusão");
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
