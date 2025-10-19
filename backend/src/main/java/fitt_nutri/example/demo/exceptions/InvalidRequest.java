package fitt_nutri.example.demo.exceptions;

public class InvalidRequest extends RuntimeException {
    public InvalidRequest(String message) {
        super(message);


    }
    @Override
    public String getMessage() {
        return "Requisição inválida".formatted(super.getMessage());
    }
}
