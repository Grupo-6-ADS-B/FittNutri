package fitt_nutri.example.demo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "refeicao")
@Data
public class MealModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String horario;
    private String descricao;
    private String observacao;

    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<MealItemModel> alimentos = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private PatientModel patient;
}

