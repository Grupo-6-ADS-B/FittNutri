package fitt_nutri.example.demo.exception;

public class UsuarioNaoEncontrado extends RuntimeException {
    public UsuarioNaoEncontrado(String message) {
        super(message);
    }

    @Override
    public String getMessage() {
        return "%s não encontrado".formatted(super.getMessage());
    }
}
