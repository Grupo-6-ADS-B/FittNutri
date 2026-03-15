-- =============================================================
-- V3: Adicionar coluna deleted_at para soft-delete
-- nas entidades sensíveis (usuario, paciente, agendamento, refeicao)
-- =============================================================

ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL;

ALTER TABLE paciente
    ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL;

ALTER TABLE agendamento
    ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL;

ALTER TABLE refeicao
    ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL;

-- Índices para performance nas queries filtradas
CREATE INDEX IF NOT EXISTS idx_usuario_deleted_at ON usuario(deleted_at);
CREATE INDEX IF NOT EXISTS idx_paciente_deleted_at ON paciente(deleted_at);
CREATE INDEX IF NOT EXISTS idx_agendamento_deleted_at ON agendamento(deleted_at);
CREATE INDEX IF NOT EXISTS idx_refeicao_deleted_at ON refeicao(deleted_at);
