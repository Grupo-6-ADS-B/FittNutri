// File: src/main/java/fitt_nutri/example/demo/controller/FormNotifyController.java
package fitt_nutri.example.demo.controller;

import fitt_nutri.example.demo.model.FormModel;
import fitt_nutri.example.demo.observer.FormSubject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/forms")
@RequiredArgsConstructor
public class FormNotifyController {

    private final FormSubject formSubject;

    @PostMapping("/notify")
    public ResponseEntity<Void> notifyForm(@RequestBody FormModel form) {
        formSubject.notifyObservers(form);
        return ResponseEntity.ok().build();
    }
}
