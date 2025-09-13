package fitt_nutri.example.demo.service;

import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean cpfExits(String cpf) {
        return userRepository.existsByCpf(cpf);
    }

    public boolean crnExits(String crn){
        return userRepository.existsByCrn(crn);
    }




}
