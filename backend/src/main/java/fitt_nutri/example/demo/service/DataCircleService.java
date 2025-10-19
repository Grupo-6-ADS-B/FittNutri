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
    public DataCircleModel cadastrar(DataCircleModel dataCircleModel) {
        if (dataCircleModel == null) throw new InvalidDataException("Dados não podem ser nulos");
        if (dataCircleModel.getIdDadosCircunferencia() != null)
            throw new InvalidDataException("ID deve ser nulo ao cadastrar um novo registro");

        // ⚠️ exige paciente por causa da FK
        if (dataCircleModel.getPaciente() == null || dataCircleModel.getPaciente().getId() == null)
            throw new InvalidDataException("Informe o paciente (paciente.id) para salvar o registro");

        // Conflito de rótulo por paciente (coerente com unique(rotulo, idUsuarioFK))
        Integer pacienteId = dataCircleModel.getPaciente().getId();
        if (repository.existsByRotuloAndPaciente_Id(dataCircleModel.getRotulo(), pacienteId))
            throw new ConflictException("Já existe um registro com rótulo '" +
                    dataCircleModel.getRotulo() + "' para este paciente.");

        if (dataCircleModel.getPesoIdeal() != null && dataCircleModel.getPesoIdeal() < 0)
            throw new InvalidDataException("O peso não pode ser negativo");

        try {
            DataCircleModel saved = repository.save(dataCircleModel);
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
    public DataCircleModel atualizar(Integer id, DataCircleModel dataCircleModel) {
        if (id == null || id <= 0) throw new InvalidDataException("ID inválido");

        DataCircleModel existingModel = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));

        if (dataCircleModel == null) throw new InvalidDataException("Dados não podem ser nulos");

        // ⚠️ exige paciente
        if (dataCircleModel.getPaciente() == null || dataCircleModel.getPaciente().getId() == null)
            throw new InvalidDataException("Informe o paciente (paciente.id) para atualizar o registro");

        Integer pacienteId = dataCircleModel.getPaciente().getId();
        if (!safeEquals(existingModel.getRotulo(), dataCircleModel.getRotulo())
                && repository.existsByRotuloAndPaciente_Id(dataCircleModel.getRotulo(), pacienteId))
            throw new ConflictException("O rótulo '" + dataCircleModel.getRotulo() + "' já existe para este paciente.");

        if (dataCircleModel.getPesoIdeal() != null && dataCircleModel.getPesoIdeal() < 0)
            throw new InvalidDataException("O peso não pode ser negativo");

        dataCircleModel.setIdDadosCircunferencia(id);

        try {
            DataCircleModel updated = repository.save(dataCircleModel);
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

        DataCircleModel model = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));

        if (updates == null || updates.isEmpty())
            throw new InvalidDataException("Nenhum dado para atualização fornecido.");

        updates.forEach((chave, valor) -> {
            switch (chave) {
                case "rotulo" -> {
                    String novoRotulo = String.valueOf(valor);
                    Integer pacienteId = (model.getPaciente() != null ? model.getPaciente().getId() : null);
                    if (pacienteId == null) throw new InvalidDataException("Registro sem paciente associado");
                    if (!safeEquals(novoRotulo, model.getRotulo())
                            && repository.existsByRotuloAndPaciente_Id(novoRotulo, pacienteId))
                        throw new ConflictException("O rótulo '" + novoRotulo + "' já existe para este paciente.");
                    model.setRotulo(novoRotulo);
                }
                case "abdominal"   -> model.setAbdominal(toDoubleSafe(valor, "abdominal"));
                case "cintura"     -> model.setCintura(toDoubleSafe(valor, "cintura"));
                case "quadril"     -> model.setQuadril(toDoubleSafe(valor, "quadril"));
                case "pulso"       -> model.setPulso(toDoubleSafe(valor, "pulso"));
                case "panturrilha" -> model.setPanturrilha(toDoubleSafe(valor, "panturrilha"));
                case "braco"       -> model.setBraco(toDoubleSafe(valor, "braco"));
                case "coxa"        -> model.setCoxa(toDoubleSafe(valor, "coxa"));
                case "pesoIdeal" -> {
                    Double pesoIdeal = toDoubleSafe(valor, "pesoIdeal");
                    if (pesoIdeal < 0) throw new InvalidDataException("O peso ideal não pode ser negativo");
                    model.setPesoIdeal(pesoIdeal);
                }
                case "idDadosCircunferencia", "paciente" ->
                    // Segurança: não permitir mudar ID nem relacionamento via PATCH cru
                        throw new InvalidDataException("Campo não permitido no PATCH: " + chave);
                default -> {
                    // Política: ignorar campos desconhecidos (ou lance erro se preferir)
                }
            }
        });

        try {
            DataCircleModel saved = repository.save(model);
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
