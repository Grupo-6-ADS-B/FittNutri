package fitt_nutri.example.demo.domain.entity;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Meal {
    private Integer id;
    private String horario;
    private String descricao;
    private String observacao;
    private Integer patientId;
    private List<MealItem> alimentos = new ArrayList<>();
}