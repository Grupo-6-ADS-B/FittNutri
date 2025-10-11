package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DataCircleModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataCircleRepository extends JpaRepository<DataCircleModel, Integer> {
}
