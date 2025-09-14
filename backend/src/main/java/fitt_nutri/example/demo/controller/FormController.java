package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.FormModel;
import fitt_nutri.example.demo.repository.FormRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/forms")
@Tag(name = "Formulários", description = "CRUD de formulários")
public class FormController {

    @Autowired
    private FormRepository formRepository;

    @Operation(summary = "Cria um formulario")
    @ApiResponse(responseCode = "201", description = "Formulário criado com suceso")
    @ApiResponse(responseCode = "400", description = "Faltou algum parâmetro na requisição ou foi escrito de forma errônea")
    @PostMapping
    public ResponseEntity<FormModel> postForm(@Valid @RequestBody FormModel formModel) {
        FormModel newModel = formRepository.save(formModel);
        return ResponseEntity.status(201).body(newModel);
    }

    @Operation(summary = "Busca todos os formulários")
    @ApiResponse(responseCode = "200", description = "Todos os formulários encontrados com suceso")
    @ApiResponse(responseCode = "204", description = "Não existe nenhum registro de formulários")
    @GetMapping
    public ResponseEntity<List<FormModel>> getForms() {
        List<FormModel> forms = formRepository.findAll();
        if (forms.isEmpty()) {
            return ResponseEntity.status(204).build();
        }
        return ResponseEntity.status(200).body(forms);
    }

    @Operation(summary = "Busca um formulário por id")
    @ApiResponse(responseCode = "200", description = "Formulário encontrado com suceso")
    @ApiResponse(responseCode = "404", description = "Formulário não encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<FormModel> getFormById(@PathVariable Integer id) {
        Optional<FormModel> formOptional = formRepository.findById(id);
        if (formOptional.isPresent()) {
            return ResponseEntity.ok(formOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Atualiza um formulário por id")
    @ApiResponse(responseCode = "200", description = "Formulário atualizado com suceso")
    @ApiResponse(responseCode = "404", description = "Formulário não encontrado")
    @PutMapping("/{id}")
    public ResponseEntity<FormModel> updateFormById(@PathVariable Integer id, @Valid @RequestBody FormModel formModel) {
        if (formRepository.existsById(id)) {
            formModel.setId(id);
            FormModel updatedForm = formRepository.save(formModel);
            return ResponseEntity.ok(updatedForm);
        } else {
            return ResponseEntity.notFound().build();
        }
    }



    @Operation(summary = "Deleta um formulário por id")
    @ApiResponse(responseCode = "204", description = "Formulário deletado com suceso")
    @ApiResponse(responseCode = "404", description = "Formulário não encontrado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormById(@PathVariable Integer id) {
        if (formRepository.existsById(id)) {
            formRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}