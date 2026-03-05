package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.dto.MacrosDTO;
import fitt_nutri.example.demo.exceptions.NotFoundException;
import fitt_nutri.example.demo.model.FoodItensModel;
import fitt_nutri.example.demo.domain.port.out.FoodItensRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodItensService {

    private final FoodItensRepositoryPort foodItensRepository;

    public FoodItensModel getFoodItemById(Integer id) {
        return foodItensRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item de alimento não encontrado"));
    }

    public List<FoodItensModel>  getAllFoodItems() {
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

        double caloriasPorGrama = safe(item.getEnergiaKcal());
        double totalCalorias = caloriasPorGrama * quantidadeEmGramas;

        return totalCalorias;
    }

    public MacrosDTO getMacrosByNome(String nome, Double quantidadeEmGramas)
            throws BadRequestException {

        if (quantidadeEmGramas <= 0) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }

        FoodItensModel item = foodItensRepository.findByNome(nome)
                .orElseThrow(() -> new NotFoundException("Alimento não encontrado"));

        Double proteina = safe(item.getProteina()) * quantidadeEmGramas;
        Double carboidrato = safe(item.getCarboidrato()) * quantidadeEmGramas;
        Double lipideos = safe(item.getLipideos()) * quantidadeEmGramas;
        Double fibra = safe(item.getFibra()) * quantidadeEmGramas;
        Double kcal = safe(item.getEnergiaKcal()) * quantidadeEmGramas;

        return new MacrosDTO(proteina, carboidrato, lipideos, fibra,kcal);
    }

    public List<FoodItensModel> findFoodsByNamePart(String nomeParte) {
        List<FoodItensModel> itens = foodItensRepository.findByNomeContainingIgnoreCase(nomeParte);

        if (itens.isEmpty()) {
            throw new NotFoundException("Nenhum alimento encontrado contendo: " + nomeParte);
        }

        return itens;
    }

    private double safe(Double value) {
        return value == null ? 0.0 : value;
    }
}