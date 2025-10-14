package fitt_nutri.example.demo.exception;

public class DadoNaoEncontrado extends RuntimeException {
    public DadoNaoEncontrado(String message) {
        super(message);
    }

    @Override
    public String getMessage() {
        return "Dado não encontrado".formatted(super.getMessage());
    }
}
