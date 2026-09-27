package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Agendamento")
@SQLRestriction("deleted_at IS NULL")
public class SchedulingModel extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private PatientModel paciente;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private UserModel nutricionista;

    @NotNull(message = "A data agendada não pode estar vazia")
    @Column(nullable = false)
    private LocalDateTime dataAgendada;

    private String observacoes;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
