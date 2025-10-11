package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.exceptions.DadosInvalidosException;
import fitt_nutri.example.demo.model.DataCircleModel;
import fitt_nutri.example.demo.repository.DataCircleRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@NoArgsConstructor
@RequiredArgsConstructor
public class DataCircleService {

    private DataCircleRepository repository;

    public DataCircleModel cadastrar(DataCircleModel dataCircleModel) {
        if (dataCircleModel == null) {
            throw new DadosInvalidosException("Dados não podem ser nulos");
        }
        if (dataCircleModel.getIdDadosCircunferencia() != null ) {
            throw new DadosInvalidosException("ID deve ser nulo ao cadastrar um novo registro");
        }
        return repository.save(dataCircleModel);
    }


}
