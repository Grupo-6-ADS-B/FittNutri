package fitt_nutri.example.demo.repository;

import fitt_nutri.example.demo.model.DietModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DietRepository extends JpaRepository<DietModel, Integer> {

    Page<DietModel> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}