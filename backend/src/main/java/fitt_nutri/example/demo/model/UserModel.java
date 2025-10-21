package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Usuario")
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    @CPF
    private String cpf;


    @Column(nullable = false)
    private String crn;


    @Column(nullable = false)
    private String senha;

    @OneToMany(mappedBy = "nutricionista", cascade = CascadeType.ALL)
    private List<SchedulingModel> agendamentos = new ArrayList<>();
}
