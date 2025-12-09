package fitt_nutri.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "historico_paciente")
@Data
public class PatientHistoryModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private PatientModel patientModel;

    @OneToOne
    @JoinColumn(name = "dados_antropometricos_id")
    private AnthropometricDataModel anthropometricDataModel;

    @OneToOne
    @JoinColumn(name = "dados_circunferencia_id")
    private DataCircleModel dataCircleModel;

    private LocalDate dataConsulta;
}
