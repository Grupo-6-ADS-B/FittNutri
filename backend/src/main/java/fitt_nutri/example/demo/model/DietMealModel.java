package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "dieta_refeicoes")
public class DietMealModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dieta_id", nullable = false)
    private DietModel dieta;

    @Column(nullable = false)
    private LocalTime horario;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @OneToMany(mappedBy = "refeicao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DietMealItemModel> itens = new ArrayList<>();
}