package fitt_nutri.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FormRequestDTO(
        @NotBlank(message = "Nome não pode estar vazio") String nome,
        @NotBlank(message = "A mensagem não pode estar vazia") String mensagem
) {}
