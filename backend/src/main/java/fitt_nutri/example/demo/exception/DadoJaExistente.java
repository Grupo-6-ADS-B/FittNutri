package fitt_nutri.example.demo.exception;

public class DadoJaExistente extends RuntimeException {
    public DadoJaExistente(String message) {
        super(message);
    }


    @Override
    public String getMessage() {
        return "Dado já existe".formatted(super.getMessage());
    }
}


