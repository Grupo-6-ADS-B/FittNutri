package fitt_nutri.example.demo.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

/**
 * Utilitário de criptografia AES-256-CBC para dados sensíveis (CPF).
 *
 * IV determinístico (derivado da chave): garante que o mesmo CPF produz
 * sempre o mesmo ciphertext, preservando a restrição UNIQUE no banco.
 *
 * A chave é configurada via propriedade app.aes-key (variável de ambiente
 * APP_AES_KEY em produção). Nunca use o valor padrão em produção.
 */
@Component
public class AesEncryptorHolder {

    private static byte[] secretKey;
    private static byte[] iv;

    @Value("${app.aes-key}")
    private String rawKey;

    @PostConstruct
    public void init() throws Exception {
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        byte[] hash = sha.digest(rawKey.getBytes(StandardCharsets.UTF_8));
        secretKey = Arrays.copyOf(hash, 32); // AES-256
        iv = Arrays.copyOf(hash, 16);        // IV determinístico (primeiros 16 bytes)
    }

    public static String encrypt(String plaintext) {
        if (plaintext == null) return null;
        try {
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(secretKey, "AES"), new IvParameterSpec(iv));
            return Base64.getEncoder().encodeToString(cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criptografar dado sensível", e);
        }
    }

    public static String decrypt(String encrypted) {
        if (encrypted == null) return null;
        try {
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(secretKey, "AES"), new IvParameterSpec(iv));
            return new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)), StandardCharsets.UTF_8);
        } catch (Exception e) {
            // CPF ainda em texto puro no banco — retorna como está
            return encrypted;
        }
    }
}
