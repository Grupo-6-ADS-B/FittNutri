package fitt_nutri.example.demo.exception;

public class NotFoundData extends RuntimeException {
    public NotFoundData(String message) {
        super(message);
    }

    @Override
    public String getMessage() {
        return "Dado não encontrado".formatted(super.getMessage());
    }
}
