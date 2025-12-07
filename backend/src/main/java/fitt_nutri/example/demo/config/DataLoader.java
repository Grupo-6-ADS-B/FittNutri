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
            p.setCpf("12345678909");
            p.setTelefone("11999999999");
            p.setEstado("SP");
            p.setCidade("São Paulo");
            p.setSexo("Masculino");
            p.setEtnia("Pardo");
            p.setAtividade("Moderada");

            repository.save(p);
            System.out.println("Paciente mock salvo: " + p.getNome());
        }
    }
}
