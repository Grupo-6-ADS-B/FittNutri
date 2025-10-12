package fitt_nutri.example.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class DateNotFound extends RuntimeException {
    public DateNotFound(String message) {
        super(message);
    }
}
