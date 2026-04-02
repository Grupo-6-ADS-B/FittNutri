package fitt_nutri.example.demo.model;

import fitt_nutri.example.demo.config.CpfConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.validator.constraints.br.CPF;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "usuario")
@SQLRestriction("deleted_at IS NULL")
public class UserModel extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @CPF
    @Column(nullable = false, unique = true)
    @Convert(converter = CpfConverter.class)
    private String cpf;

    @Column(nullable = false)
    private String crn;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String role = "NUTRI";

    @Column(nullable = true, length = 512)
    private String foto;

    @OneToMany(mappedBy = "nutricionista", cascade = CascadeType.ALL)
    private List<PatientModel> pacientes = new ArrayList<>();

    @OneToMany(mappedBy = "nutricionista", cascade = CascadeType.ALL)
    private List<SchedulingModel> agendamentos = new ArrayList<>();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
