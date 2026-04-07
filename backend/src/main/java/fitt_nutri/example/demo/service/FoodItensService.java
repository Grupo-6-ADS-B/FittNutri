package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.dto.request.FoodItensRequestDTO;
import fitt_nutri.example.demo.dto.response.FoodItensResponseDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.FoodItensRepository;
import fitt_nutri.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FoodItensService {

    private final FoodItensRepository foodItensRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Leitura (endpoints existentes)
    // -------------------------------------------------------------------------

    public Page<FoodItensModel> findAll(Pageable pageable) {
        return foodItensRepository.findAll(pageable);
    }

    public FoodItensModel getFoodItemById(Integer id) {
        return foodItensRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item de alimento não encontrado"));
    }

    public List<FoodItensModel> getAllFoodItems() {
        return foodItensRepository.findAll();
    }

    public FoodItensModel findByName(String nome, Double quantidadeEmGramas) throws BadRequestException {
        if (quantidadeEmGramas <= 0) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }

        FoodItensModel item = foodItensRepository.findByNome(nome)
                .orElseThrow(() -> new NotFoundException("Alimento não encontrado"));

        FoodItensModel resultado = new FoodItensModel();
        resultado.setId(item.getId());
        resultado.setNome(item.getNome());
        resultado.setFonte(item.getFonte());

        resultado.setUmidade(safe(item.getUmidade()) * quantidadeEmGramas);
        resultado.setEnergiaKcal(safe(item.getEnergiaKcal()) * quantidadeEmGramas);
        resultado.setProteina(safe(item.getProteina()) * quantidadeEmGramas);
        resultado.setLipideos(safe(item.getLipideos()) * quantidadeEmGramas);
        resultado.setColesterol(safe(item.getColesterol()) * quantidadeEmGramas);
        resultado.setCarboidrato(safe(item.getCarboidrato()) * quantidadeEmGramas);
        resultado.setFibra(safe(item.getFibra()) * quantidadeEmGramas);
        resultado.setCinzas(safe(item.getCinzas()) * quantidadeEmGramas);
        resultado.setCalcio(safe(item.getCalcio()) * quantidadeEmGramas);
        resultado.setMagnesio(safe(item.getMagnesio()) * quantidadeEmGramas);
        resultado.setManganes(safe(item.getManganes()) * quantidadeEmGramas);
        resultado.setFosforo(safe(item.getFosforo()) * quantidadeEmGramas);
        resultado.setFerro(safe(item.getFerro()) * quantidadeEmGramas);
        resultado.setSodio(safe(item.getSodio()) * quantidadeEmGramas);
        resultado.setPotassio(safe(item.getPotassio()) * quantidadeEmGramas);
        resultado.setCobre(safe(item.getCobre()) * quantidadeEmGramas);
        resultado.setZinco(safe(item.getZinco()) * quantidadeEmGramas);
        resultado.setRetinol(safe(item.getRetinol()) * quantidadeEmGramas);
        resultado.setTiamina(safe(item.getTiamina()) * quantidadeEmGramas);
        resultado.setRiboflavina(safe(item.getRiboflavina()) * quantidadeEmGramas);
        resultado.setPiridoxina(safe(item.getPiridoxina()) * quantidadeEmGramas);
        resultado.setNiacina(safe(item.getNiacina()) * quantidadeEmGramas);
        resultado.setVitaminaC(safe(item.getVitaminaC()) * quantidadeEmGramas);

        return resultado;
    }

    public Double getCaloriasByNomeAndGramas(String nome, Double quantidadeEmGramas) throws BadRequestException {
        if (quantidadeEmGramas == null || quantidadeEmGramas <= 0) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }
        FoodItensModel item = foodItensRepository.findByNome(nome)
                .orElseThrow(() -> new NotFoundException("Alimento não encontrado"));
        return safe(item.getEnergiaKcal()) * quantidadeEmGramas;
    }

    public MacrosDTO getMacrosByNome(String nome, Double quantidadeEmGramas) throws BadRequestException {
        if (quantidadeEmGramas <= 0) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }
        FoodItensModel item = foodItensRepository.findByNome(nome)
                .orElseThrow(() -> new NotFoundException("Alimento não encontrado"));
        return new MacrosDTO(
                safe(item.getProteina()) * quantidadeEmGramas,
                safe(item.getCarboidrato()) * quantidadeEmGramas,
                safe(item.getLipideos()) * quantidadeEmGramas,
                safe(item.getFibra()) * quantidadeEmGramas,
                safe(item.getEnergiaKcal()) * quantidadeEmGramas
        );
    }

    /** Busca por parte do nome — retorna TACO + alimentos custom do nutricionista logado. */
    public List<FoodItensResponseDTO> findFoodsByNamePart(String nomeParte) {
        UserModel nutricionista = getNutricionistaLogado();
        List<FoodItensModel> itens = foodItensRepository
                .searchByNameForNutricionista(nomeParte, nutricionista.getId());
        if (itens.isEmpty()) {
            throw new NotFoundException("Nenhum alimento encontrado contendo: " + nomeParte);
        }
        return itens.stream().map(this::toResponseDTO).toList();
    }

    // -------------------------------------------------------------------------
    // CRUD de alimentos custom (Fase 2)
    // -------------------------------------------------------------------------

    /** Cria um alimento com fonte=CUSTOM vinculado ao nutricionista logado. */
    public FoodItensResponseDTO criarCustom(FoodItensRequestDTO dto) {
        UserModel nutricionista = getNutricionistaLogado();
        FoodItensModel model = fromRequestDTO(dto);
        model.setFonte("CUSTOM");
        model.setNutricionista(nutricionista);
        return toResponseDTO(foodItensRepository.save(model));
    }

    /** Lista somente os alimentos CUSTOM do nutricionista logado. */
    public List<FoodItensResponseDTO> listarMeusAlimentos() {
        UserModel nutricionista = getNutricionistaLogado();
        return foodItensRepository
                .findByNutricionistaIdAndFonte(nutricionista.getId(), "CUSTOM")
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    /** Atualiza completamente um alimento CUSTOM do nutricionista logado. */
    public FoodItensResponseDTO atualizarCustom(Integer id, FoodItensRequestDTO dto) {
        FoodItensModel model = buscarCustomComPropriedade(id);
        aplicarRequestDTO(model, dto);
        return toResponseDTO(foodItensRepository.save(model));
    }

    /** Atualização parcial (PATCH) de um alimento CUSTOM. */
    public FoodItensResponseDTO atualizarParcialCustom(Integer id, Map<String, Object> campos) {
        FoodItensModel model = buscarCustomComPropriedade(id);
        campos.forEach((key, value) -> aplicarCampo(model, key, value));
        return toResponseDTO(foodItensRepository.save(model));
    }

    /** Remove um alimento CUSTOM do nutricionista logado. */
    public void deletarCustom(Integer id) {
        FoodItensModel model = buscarCustomComPropriedade(id);
        foodItensRepository.delete(model);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private UserModel getNutricionistaLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED,
                        "Nutricionista não autenticado"));
    }

    private FoodItensModel buscarCustomComPropriedade(Integer id) {
        FoodItensModel model = foodItensRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Alimento não encontrado"));
        if (!"CUSTOM".equals(model.getFonte())) {
            throw new AccessDeniedException("Alimentos TACO não podem ser modificados");
        }
        UserModel nutricionista = getNutricionistaLogado();
        if (model.getNutricionista() == null ||
                !nutricionista.getId().equals(model.getNutricionista().getId())) {
            throw new AccessDeniedException("Você não tem permissão para modificar este alimento");
        }
        return model;
    }

    private FoodItensModel fromRequestDTO(FoodItensRequestDTO dto) {
        FoodItensModel m = new FoodItensModel();
        aplicarRequestDTO(m, dto);
        return m;
    }

    private void aplicarRequestDTO(FoodItensModel m, FoodItensRequestDTO dto) {
        m.setNome(dto.nome());
        m.setEnergiaKcal(dto.energiaKcal());
        m.setProteina(dto.proteina());
        m.setCarboidrato(dto.carboidrato());
        m.setLipideos(dto.lipideos());
        m.setFibra(dto.fibra());
        m.setUmidade(dto.umidade());
        m.setColesterol(dto.colesterol());
        m.setCinzas(dto.cinzas());
        m.setCalcio(dto.calcio());
        m.setMagnesio(dto.magnesio());
        m.setManganes(dto.manganes());
        m.setFosforo(dto.fosforo());
        m.setFerro(dto.ferro());
        m.setSodio(dto.sodio());
        m.setPotassio(dto.potassio());
        m.setCobre(dto.cobre());
        m.setZinco(dto.zinco());
        m.setRetinol(dto.retinol());
        m.setTiamina(dto.tiamina());
        m.setRiboflavina(dto.riboflavina());
        m.setPiridoxina(dto.piridoxina());
        m.setNiacina(dto.niacina());
        m.setVitaminaC(dto.vitaminaC());
    }

    private void aplicarCampo(FoodItensModel m, String key, Object value) {
        switch (key) {
            case "nome"         -> m.setNome((String) value);
            case "energiaKcal"  -> m.setEnergiaKcal(toDouble(value));
            case "proteina"     -> m.setProteina(toDouble(value));
            case "carboidrato"  -> m.setCarboidrato(toDouble(value));
            case "lipideos"     -> m.setLipideos(toDouble(value));
            case "fibra"        -> m.setFibra(toDouble(value));
            case "umidade"      -> m.setUmidade(toDouble(value));
            case "colesterol"   -> m.setColesterol(toDouble(value));
            case "cinzas"       -> m.setCinzas(toDouble(value));
            case "calcio"       -> m.setCalcio(toDouble(value));
            case "magnesio"     -> m.setMagnesio(toDouble(value));
            case "manganes"     -> m.setManganes(toDouble(value));
            case "fosforo"      -> m.setFosforo(toDouble(value));
            case "ferro"        -> m.setFerro(toDouble(value));
            case "sodio"        -> m.setSodio(toDouble(value));
            case "potassio"     -> m.setPotassio(toDouble(value));
            case "cobre"        -> m.setCobre(toDouble(value));
            case "zinco"        -> m.setZinco(toDouble(value));
            case "retinol"      -> m.setRetinol(toDouble(value));
            case "tiamina"      -> m.setTiamina(toDouble(value));
            case "riboflavina"  -> m.setRiboflavina(toDouble(value));
            case "piridoxina"   -> m.setPiridoxina(toDouble(value));
            case "niacina"      -> m.setNiacina(toDouble(value));
            case "vitaminaC"    -> m.setVitaminaC(toDouble(value));
            case "id", "fonte", "nutricionista" ->
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Campo '" + key + "' não pode ser alterado via PATCH");
            default -> throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Campo '" + key + "' inválido");
        }
    }

    private Double toDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(value.toString()); }
        catch (NumberFormatException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Valor numérico inválido: " + value);
        }
    }

    private FoodItensResponseDTO toResponseDTO(FoodItensModel m) {
        return new FoodItensResponseDTO(
                m.getId(), m.getNome(), m.getFonte(),
                m.getEnergiaKcal(), m.getProteina(), m.getCarboidrato(),
                m.getLipideos(), m.getFibra(), m.getUmidade(),
                m.getColesterol(), m.getCinzas(), m.getCalcio(),
                m.getMagnesio(), m.getManganes(), m.getFosforo(),
                m.getFerro(), m.getSodio(), m.getPotassio(),
                m.getCobre(), m.getZinco(), m.getRetinol(),
                m.getTiamina(), m.getRiboflavina(), m.getPiridoxina(),
                m.getNiacina(), m.getVitaminaC()
        );
    }

    private double safe(Double value) {
        return value == null ? 0.0 : value;
    }
}
