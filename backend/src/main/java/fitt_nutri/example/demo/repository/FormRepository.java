package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.FormModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormRepository extends JpaRepository<FormModel, Integer> {

}
