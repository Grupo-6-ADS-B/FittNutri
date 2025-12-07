package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "refeicao")
@Data
public class MealModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String horario;
    private String descricao;
    private String alimento;
    private Double quantidade;
    private String unidade;
    private String observacao;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private PatientModel patient;
}

