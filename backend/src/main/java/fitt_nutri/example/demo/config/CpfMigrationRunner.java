package fitt_nutri.example.demo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Migração de CPFs em texto plano para AES-256-CBC.
 *
 * Executa apenas quando app.run-cpf-migration=true (padrão: false).
 * Usa JdbcTemplate para ler os valores brutos do banco, ignorando o
 * CpfConverter JPA — assim lê o que realmente está armazenado.
 *
 * Detecção de texto plano: CPF formatado tem no máximo 14 chars
 * ("123.456.789-09"); o valor criptografado (Base64 de AES) tem
 * sempre pelo menos 24 chars. Qualquer valor com <= 14 chars é
 * considerado texto plano e será criptografado.
 *
 * Como executar:
 *   1. Defina app.run-cpf-migration=true (ou APP_RUN_CPF_MIGRATION=true)
 *   2. Suba a aplicação normalmente — a migração roda automaticamente
 *   3. Verifique os logs: "Migração de CPF concluída"
 *   4. Remova/defina como false antes do próximo restart
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CpfMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    @Value("${app.run-cpf-migration:false}")
    private boolean runMigration;

    // Comprimento máximo de um CPF em texto plano (com formatação: 123.456.789-09 = 14)
    private static final int MAX_PLAIN_CPF_LENGTH = 14;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!runMigration) {
            log.info("[CpfMigration] Migração desativada (app.run-cpf-migration=false). Nenhuma ação executada.");
            return;
        }

        log.warn("[CpfMigration] *** INICIANDO MIGRAÇÃO DE CPF — não interrompa a aplicação ***");

        int usuariosMigrados = migrarTabela("usuario", "id");
        int pacientesMigrados = migrarTabela("Paciente", "id");

        log.warn("[CpfMigration] *** MIGRAÇÃO CONCLUÍDA: {} nutricionistas, {} pacientes migrados ***",
                usuariosMigrados, pacientesMigrados);
        log.warn("[CpfMigration] Defina app.run-cpf-migration=false antes do próximo restart.");
    }

    private int migrarTabela(String tabela, String colunaId) {
        List<Map<String, Object>> registros = jdbc.queryForList(
                "SELECT " + colunaId + ", cpf FROM " + tabela
        );

        int migrados = 0;
        int jaEncriptados = 0;
        int erros = 0;

        for (Map<String, Object> row : registros) {
            Object id = row.get(colunaId);
            String cpfBruto = (String) row.get("cpf");

            if (cpfBruto == null || cpfBruto.isBlank()) {
                log.warn("[CpfMigration] Tabela={} id={}: CPF nulo ou vazio — ignorado.", tabela, id);
                continue;
            }

            if (jaEstaEncriptado(cpfBruto)) {
                jaEncriptados++;
                continue;
            }

            try {
                String cpfEncriptado = AesEncryptorHolder.encrypt(cpfBruto);
                jdbc.update(
                        "UPDATE " + tabela + " SET cpf = ? WHERE " + colunaId + " = ?",
                        cpfEncriptado, id
                );
                migrados++;
                log.info("[CpfMigration] Tabela={} id={}: CPF criptografado com sucesso.", tabela, id);
            } catch (Exception e) {
                erros++;
                log.error("[CpfMigration] Tabela={} id={}: ERRO ao criptografar — {}",
                        tabela, id, e.getMessage());
            }
        }

        log.info("[CpfMigration] Tabela={}: {} migrados, {} já encriptados, {} erros.",
                tabela, migrados, jaEncriptados, erros);

        if (erros > 0) {
            throw new RuntimeException(
                    "[CpfMigration] " + erros + " erro(s) na tabela " + tabela +
                    " — a transação será revertida. Verifique os logs acima."
            );
        }

        return migrados;
    }

    /**
     * Um CPF em texto plano tem no máximo 14 caracteres.
     * Um CPF criptografado (Base64 AES/CBC de 11-14 chars) tem pelo menos 24 caracteres.
     */
    private boolean jaEstaEncriptado(String valor) {
        return valor.length() > MAX_PLAIN_CPF_LENGTH;
    }
}
