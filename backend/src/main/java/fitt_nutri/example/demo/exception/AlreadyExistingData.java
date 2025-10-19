package fitt_nutri.example.demo.exception;

public class AlreadyExistingData extends RuntimeException {
    public AlreadyExistingData(String message) {
        super(message);
    }


    @Override
    public String getMessage() {
        return "Dado já existe".formatted(super.getMessage());
    }
}


