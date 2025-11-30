package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "alimentos")
public class FoodItensModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "umidade")
    private Double umidade;

    @Column(name = "energia_kcal")
    private Double energiaKcal;

    @Column(name = "proteina")
    private Double proteina;

    @Column(name = "lipideos")
    private Double lipideos;

    @Column(name = "colesterol")
    private Double colesterol;

    @Column(name = "carboidrato")
    private Double carboidrato;

    @Column(name = "fibra")
    private Double fibra;

    @Column(name = "cinzas")
    private Double cinzas;

    @Column(name = "calcio")
    private Double calcio;

    @Column(name = "magnesio")
    private Double magnesio;

    @Column(name = "manganes")
    private Double manganes;

    @Column(name = "fosforo")
    private Double fosforo;

    @Column(name = "ferro")
    private Double ferro;

    @Column(name = "sodio")
    private Double sodio;

    @Column(name = "potassio")
    private Double potassio;

    @Column(name = "cobre")
    private Double cobre;

    @Column(name = "zinco")
    private Double zinco;

    @Column(name = "retinol")
    private Double retinol;

    @Column(name = "tiamina")
    private Double tiamina;

    @Column(name = "riboflavina")
    private Double riboflavina;

    @Column(name = "piridoxina")
    private Double piridoxina;

    @Column(name = "niacina")
    private Double niacina;

    @Column(name = "vitaminaC")
    private Double vitaminaC;
}
