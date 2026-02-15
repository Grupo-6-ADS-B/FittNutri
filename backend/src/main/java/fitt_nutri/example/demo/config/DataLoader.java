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

    }
}
