package fitt_nutri.example.demo.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Conversor JPA que criptografa o CPF antes de persistir no banco
 * e descriptografa ao carregar a entidade.
 *
 * A validação @CPF ocorre antes da persistência (bean validation),
 * portanto o valor validado é sempre o CPF em texto claro.
 */
@Converter
public class CpfConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String cpf) {
        return AesEncryptorHolder.encrypt(cpf);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return AesEncryptorHolder.decrypt(dbData);
    }
}
