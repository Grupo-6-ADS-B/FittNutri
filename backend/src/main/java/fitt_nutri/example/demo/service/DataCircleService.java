package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.DateNotFound;
import fitt_nutri.example.demo.exceptions.InvalidDataException;
import fitt_nutri.example.demo.exceptions.ConflictException; // Importado
import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DataCircleService {

    private final DataCircleRepository repository;

    public DataCircleModel cadastrar(DataCircleModel dataCircleModel) {
        if (dataCircleModel == null) {
            throw new InvalidDataException("Dados não podem ser nulos");
        }
        if (dataCircleModel.getIdDadosCircunferencia() != null ) {
            throw new InvalidDataException("ID deve ser nulo ao cadastrar um novo registro");
        }

        // --- VALIDAÇÃO DE CONFLITO (409) no Cadastro ---
        if (repository.existsByRotulo(dataCircleModel.getRotulo())) {
            throw new ConflictException("Já existe um registro cadastrado com o rótulo: '" + dataCircleModel.getRotulo() + "'.");
        }
        // ----------------------------------------------

        // Melhorando a validação de peso, garantindo que não seja nulo antes de checar.
        if (dataCircleModel.getPesoIdeal() != null && dataCircleModel.getPesoIdeal() < 0) {
            throw new InvalidDataException("O peso nao pode ser negativo");

        }

        return repository.save(dataCircleModel);
    }

    public List<DataCircleModel> pegarTodos(){
        List<DataCircleModel> list = repository.findAll(); // Não precisa de new ArrayList<>() aqui

        if (list.isEmpty()) { // Simples e direto
            throw new DateNotFound("Nenhum dado encontrado");
        }
        return list;

    }

    public DataCircleModel pegarPorId(Integer id) {
        if (id == null || id <= 0) {
            throw new InvalidDataException("ID inválido");
        }

        // Usando orElseThrow para simplificar a busca e tratamento 404
        return repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));
    }

    public DataCircleModel atualizar(Integer id, DataCircleModel dataCircleModel) {
        if (id == null || id <= 0 ) {
            throw new InvalidDataException("ID inválido");
        }

        // 1. Busca para verificar a existência (trata 404)
        DataCircleModel existingModel = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));

        if (dataCircleModel == null ) {
            throw new InvalidDataException("Dados não podem ser nulos");
        }

        // --- VALIDAÇÃO DE CONFLITO (409) no Update (PUT) ---
        // Checa se o rótulo foi alterado E se o novo rótulo já existe
        if (!existingModel.getRotulo().equals(dataCircleModel.getRotulo()) && repository.existsByRotulo(dataCircleModel.getRotulo())) {
            throw new ConflictException("O rótulo '" + dataCircleModel.getRotulo() + "' já está sendo usado por outro registro.");
        }
        // -----------------------------------------------------

        if (dataCircleModel.getPesoIdeal() != null && dataCircleModel.getPesoIdeal() < 0) {
            throw new InvalidDataException("O peso nao pode ser negativo");
        }


        dataCircleModel.setIdDadosCircunferencia(id);
        return repository.save(dataCircleModel);
    }


    public DataCircleModel atualizarParcial(Integer id, Map<String, Object> updates) {
        if (id == null || id <= 0) {
            throw new InvalidDataException("ID inválido");
        }

        // 1. Busca o registro existente
        DataCircleModel dataCircleModel = repository.findById(id)
                .orElseThrow(() -> new DateNotFound("ID não encontrado"));

        if (updates == null || updates.isEmpty()) {
            throw new InvalidDataException("Nenhum dado para atualização fornecido.");
        }

        // 2. Aplica as atualizações parciais
        updates.forEach((chave, valor) -> {
            try {
                // É crucial converter o valor (Object) para o tipo esperado (Double)
                switch (chave) {
                    case "rotulo":
                        String novoRotulo = valor.toString();
                        // --- VALIDAÇÃO DE CONFLITO (409) no Update Parcial (PATCH) ---
                        // Se o valor do campo 'rotulo' for diferente do atual E já existir no BD
                        if (!novoRotulo.equals(dataCircleModel.getRotulo()) && repository.existsByRotulo(novoRotulo)) {
                            throw new ConflictException("O rótulo '" + novoRotulo + "' já está sendo usado por outro registro.");
                        }
                        dataCircleModel.setRotulo(novoRotulo);
                        break;
                    case "abdominal":
                        dataCircleModel.setAbdominal(Double.valueOf(valor.toString()));
                        break;
                    case "cintura":
                        dataCircleModel.setCintura(Double.valueOf(valor.toString()));
                        break;
                    case "quadril":
                        dataCircleModel.setQuadril(Double.valueOf(valor.toString()));
                        break;
                    case "pulso":
                        dataCircleModel.setPulso(Double.valueOf(valor.toString()));
                        break;
                    case "panturrilha":
                        dataCircleModel.setPanturrilha(Double.valueOf(valor.toString()));
                        break;
                    case "braco":
                        dataCircleModel.setBraco(Double.valueOf(valor.toString()));
                        break;
                    case "coxa":
                        dataCircleModel.setCoxa(Double.valueOf(valor.toString()));
                        break;
                    case "pesoIdeal":
                        Double pesoIdeal = Double.valueOf(valor.toString());
                        // 3. Revalida a regra de negócio se o campo for atualizado
                        if (pesoIdeal < 0) {
                            throw new InvalidDataException("O peso ideal nao pode ser negativo");
                        }
                        dataCircleModel.setPesoIdeal(pesoIdeal);
                        break;
                    default:
                        // Ignora campos que não existem no modelo ou que não devem ser alterados
                        break;
                }
            } catch (NumberFormatException e) {
                throw new InvalidDataException("Valor inválido ou no formato incorreto para o campo: " + chave);
            }
        });

        // 4. Salva o registro atualizado
        return repository.save(dataCircleModel);
    }

    public void deletar(Integer id) {
        if (id == null || id <= 0) {
            throw new InvalidDataException("ID inválido");
        }

        if (!repository.existsById(id)) {
            throw new DateNotFound("Registro não encontrado para exclusão");
        }

        repository.deleteById(id);
    }

    public long contarRegistros() {
        return repository.count();
    }
}
