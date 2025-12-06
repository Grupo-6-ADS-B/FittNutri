package fitt_nutri.example.demo.config;

import fitt_nutri.example.demo.model.PatientModel;
import fitt_nutri.example.demo.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final PatientRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            PatientModel p = new PatientModel();
            p.setNome("João Silva");
            p.setEmail("joao.silva@example.com");
            p.setCpf("12345678909"); // CPF de teste válido
            p.setDataNascimento(LocalDate.of(1990, 1, 15));
            p.setSexo("Masculino");
            p.setEstadoCivil("Solteiro");
            p.setDataConsulta(LocalDate.now());
            p.setMotivoConsulta("Avaliação nutricional");
            p.setComorbidade("Nenhuma");
            p.setFrequenciaAtividadeFisica(3);

            repository.save(p);
            System.out.println("Paciente mock salvo: " + p.getNome());
        }
    }
}
