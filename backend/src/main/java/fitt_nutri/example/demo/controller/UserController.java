package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.repository.UserRepository;
import fitt_nutri.example.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5500")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<UserModel> createUser(@Valid @RequestBody UserModel userModel) {

        UserModel newUser = userService.createUser(userModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);

    }


    @GetMapping
    public ResponseEntity<List<UserModel>> listUsers() {
            List<UserModel> users = userService.listUsers();
            return ResponseEntity.ok(users);


    }

    @GetMapping("/{id}")
    public ResponseEntity<UserModel>  listUserById(@PathVariable Integer id){

        UserModel user = userService.listUserById(id);

        if(!userRepository.existsById(id)){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } else {
            return ResponseEntity.ok(user);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserModel> updateUserById(@PathVariable Integer id, @RequestBody UserModel userModel) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } else {
            userModel.setId(id);
            UserModel updatedUser = userRepository.save(userModel);
            return ResponseEntity.ok(updatedUser);
        }
    }


    @PutMapping("/crn/{crn}")
    public ResponseEntity<UserModel> updateUserByCrn(@PathVariable String crn, @RequestBody UserModel userModel) {
        List<UserModel> matchingUsers = userRepository.findByCrnContaining(crn);

        if (matchingUsers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        UserModel existingUser = matchingUsers.get(0);

        userModel.setId(existingUser.getId());
        UserModel updatedUser = userRepository.save(userModel);

        return ResponseEntity.ok(updatedUser);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Integer id) {
        boolean deleted = userService.deleteUserById(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping()
    public ResponseEntity<Void> deleteAllUsers() {
        userRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }



}
