package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.UserModel;
import fitt_nutri.example.demo.dto.LoginRequest;
import fitt_nutri.example.demo.repository.UserRepository;
import fitt_nutri.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.swing.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5500")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthService authService;

    public UserController(UserService userService, UserRepository userRepository, AuthService authService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Tag(name = "Usuários", description = "CRUD de usuários")
    public class UserController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private UserService userService;

        @Operation(summary = "Cria um usuário")
        @ApiResponse(responseCode = "201", description = "Usuário criado com suceso")
        @ApiResponse(responseCode = "400", description = "Faltou algum parâmetro na requisição ou foi escrito de forma errônea")
        @ApiResponse(responseCode = "409", description = "Email, cpf ou crn em conflito com registro do banco")
        @PostMapping
        public ResponseEntity<UserModel> postUsers(@Valid @RequestBody UserModel userModel) {

            if (userService.emailExists(userModel.getEmail()) ||
                    userService.cpfExits(userModel.getCpf()) ||
                    userService.crnExits(userModel.getCrn())) {
                return ResponseEntity.status(409).build();
            } else {
                userRepository.save(userModel);
                return ResponseEntity.status(201).body(userModel);
            }

        }

        @Operation(summary = "Busca todos os usuários")
        @ApiResponse(responseCode = "200", description = "Todos os usuários encontrados com suceso")
        @ApiResponse(responseCode = "204", description = "Não existe nenhum registro de usuários")
        @GetMapping
        public ResponseEntity<List<UserModel>> getUsers() {
            var users = userRepository.findAll();

            return users.isEmpty() ? ResponseEntity.status(204).build() : ResponseEntity.status(200).body(users);

        }

        @Operation(summary = "Busca um usuário por id")
        @ApiResponse(responseCode = "200", description = "Usuário encontrado com suceso")
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
        @GetMapping("/{id}")
        public ResponseEntity<UserModel> getUserById(@PathVariable Integer id) {

            if (userRepository.existsById(id)) {

                UserModel userFind = userRepository.findById(id).get();
                return ResponseEntity.status(200).body(userFind);
            } else {
                return ResponseEntity.status(404).build();
            }
        }


        @Operation(summary = "Atualiza todos os campos de um usuário por id")
        @ApiResponse(responseCode = "200", description = "Usuário encontrado com suceso")
        @ApiResponse(responseCode = "400", description = "Faltou algum parâmetro na requisição ou foi escrito de forma errônea")
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
        @PutMapping("/{id}")
        public ResponseEntity<UserModel> updateUserByID(@PathVariable Integer id,
                                                        @Valid @RequestBody UserModel updateUser) {

            if (userRepository.existsById(id)) {

                UserModel exitingUser = userRepository.findById(id).get();

                exitingUser.setNome(updateUser.getNome());
                exitingUser.setEmail(updateUser.getEmail());
                exitingUser.setCpf(updateUser.getCpf());
                exitingUser.setCrn(updateUser.getCrn());
                exitingUser.setSenha(updateUser.getSenha());

                userRepository.save(exitingUser);

                return ResponseEntity.status(200).body(exitingUser);
            } else {
                return ResponseEntity.status(404).build();
            }

        }


        @Operation(summary = "Exclui um usuário por id")
        @ApiResponse(responseCode = "200", description = "Usuário excluído com sucesso")
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteUserById(@PathVariable Integer id) {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                return ResponseEntity.status(204).build();
            } else {
                return ResponseEntity.status(404).build();
            }
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
            UserModel user = userRepository.findAll().stream()
                    .filter(u -> u.getEmail().equals(loginRequest.getEmail()))
                    .findFirst()
                    .orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body("Usuário não encontrado");
            }
            if (!user.getSenha().equals(loginRequest.getSenha())) {
                return ResponseEntity.status(401).body("Senha incorreta");
            }
            UserModel safeUser = new UserModel();
            safeUser.setId(user.getId());
            safeUser.setNome(user.getNome());
            safeUser.setEmail(user.getEmail());
            safeUser.setCpf(user.getCpf());
            safeUser.setCrn(user.getCrn());
            return ResponseEntity.ok(safeUser);
        }
    }
}
