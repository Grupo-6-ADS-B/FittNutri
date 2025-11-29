package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "alimentos")
public class FoodItensModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "umidade")
    private double umidade;

    @Column(name = "energia_kcal")
    private double energiaKcal;

    @Column(name = "proteina")
    private double proteina;

    @Column(name = "lipideos")
    private double lipideos;

    @Column(name = "colesterol")
    private double colesterol;

    @Column(name = "carboidrato")
    private double carboidrato;

    @Column(name = "fibra")
    private double fibra;

    @Column(name = "cinzas")
    private double cinzas;

    @Column(name = "calcio")
    private double calcio;

    @Column(name = "magnesio")
    private double magnesio;

    @Column(name = "manganes")
    private double manganes;

    @Column(name = "fosforo")
    private double fosforo;

    @Column(name = "ferro")
    private double ferro;

    @Column(name = "sodio")
    private double sodio;

    @Column(name = "potassio")
    private double potassio;

    @Column(name = "cobre")
    private double cobre;

    @Column(name = "zinco")
    private double zinco;

    @Column(name = "retinol")
    private double retinol;

    @Column(name = "tiamina")
    private double tiamina;

    @Column(name = "riboflavina")
    private double riboflavina;

    @Column(name = "piridoxina")
    private double piridoxina;

    @Column(name = "niacina")
    private double niacina;

    @Column(name = "vitaminaC")
    private double vitaminaC;
}
