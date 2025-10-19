package fitt_nutri.example.demo.exceptions;

public class NotFoundUser extends RuntimeException {
    public NotFoundUser(String message) {
        super(message);
    }

    @Override
    public String getMessage() {
        return "%s não encontrado".formatted(super.getMessage());
    }
}