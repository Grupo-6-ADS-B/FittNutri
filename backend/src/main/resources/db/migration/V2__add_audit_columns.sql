-- =============================================================
-- V2: Adicionar colunas de auditoria (created_at, updated_at)
-- em tabelas que já existem sem esses campos
-- =============================================================

-- Adiciona colunas de auditoria apenas se não existirem
-- (para bancos que já foram atualizados via ddl-auto=update)

ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE paciente
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE agendamento
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE dados_antropometricos
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE dados_circunferencia
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE forms
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE refeicao
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE meal_item
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE historico_paciente
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

ALTER TABLE alimentos
    ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

-- Preencher registros existentes com timestamp atual
UPDATE usuario SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE paciente SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE agendamento SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE dados_antropometricos SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE dados_circunferencia SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE forms SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE refeicao SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE meal_item SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE historico_paciente SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
UPDATE alimentos SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
