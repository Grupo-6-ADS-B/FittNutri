package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "alimentos")
public class FoodItensModel extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fonte", nullable = false, length = 10)
    private String fonte = "TACO";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutricionista_id")
    private UserModel nutricionista;

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

    // Medidas caseiras do front: gramas de 1 unidade da medida (null = alimento não usa a medida).
    // Fonte: Tabela de Medidas Referidas do IBGE (POF 2008-2009), carregada por dados/ETL/tratamento.py
    @Column(name = "gramas_unidade")
    private Double gramasUnidade;

    @Column(name = "gramas_colher_sopa")
    private Double gramasColherSopa;

    @Column(name = "gramas_colher_cha")
    private Double gramasColherCha;

    @Column(name = "gramas_xicara")
    private Double gramasXicara;

    @Column(name = "gramas_ml")
    private Double gramasMl;
}
