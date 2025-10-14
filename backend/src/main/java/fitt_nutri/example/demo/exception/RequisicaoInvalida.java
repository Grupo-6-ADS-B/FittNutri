package fitt_nutri.example.demo.exception;

public class RequisicaoInvalida extends RuntimeException {
    public RequisicaoInvalida(String message) {
        super(message);


    }
    @Override
    public String getMessage() {
        return "Requisição inválida".formatted(super.getMessage());
    }
}
