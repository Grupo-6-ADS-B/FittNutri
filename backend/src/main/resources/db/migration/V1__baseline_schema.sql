-- =============================================================
-- V1: Baseline — estrutura atual do banco FittNutri
-- Flyway baseline-on-migrate=true garante que este script
-- NÃO será executado em bancos já existentes (baseline-version=0)
-- =============================================================

-- Tabela de usuários (nutricionistas)
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(255) NOT NULL UNIQUE,
    crn VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT 'NUTRI',
    created_at DATETIME NULL,
    updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS paciente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(255),
    estado VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    sexo VARCHAR(255) NOT NULL,
    etnia VARCHAR(255) NOT NULL,
    atividade VARCHAR(255) NOT NULL,
    user_id INT,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (user_id) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_agendada DATE NOT NULL,
    observacoes TEXT,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_agendamento_paciente FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    CONSTRAINT fk_agendamento_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de dados antropométricos
CREATE TABLE IF NOT EXISTS dados_antropometricos (
    id_dados_antropometricos INT AUTO_INCREMENT PRIMARY KEY,
    peso DOUBLE,
    altura DOUBLE,
    idade INT,
    imc DOUBLE,
    porcentagem_gordura DOUBLE,
    massa_muscular DOUBLE,
    gordura_visceral DOUBLE,
    taxa_metabolica_basal DOUBLE,
    idade_metabolica INT,
    patient_id INT NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_antropometrico_paciente FOREIGN KEY (patient_id) REFERENCES paciente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de dados de circunferência
CREATE TABLE IF NOT EXISTS dados_circunferencia (
    id_dados_circunferencia INT AUTO_INCREMENT PRIMARY KEY,
    abdominal DOUBLE,
    cintura DOUBLE,
    quadril DOUBLE,
    pulso DOUBLE,
    panturrilha DOUBLE,
    braco DOUBLE,
    coxa DOUBLE,
    peso_ideal DOUBLE,
    id_usuario_fk INT NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_circunferencia_paciente FOREIGN KEY (id_usuario_fk) REFERENCES paciente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de formulários
CREATE TABLE IF NOT EXISTS forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    mensagem VARCHAR(255) NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de refeições
CREATE TABLE IF NOT EXISTS refeicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    horario VARCHAR(255),
    descricao VARCHAR(255),
    observacao VARCHAR(255),
    patient_id INT,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_refeicao_paciente FOREIGN KEY (patient_id) REFERENCES paciente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de itens de refeição
CREATE TABLE IF NOT EXISTS meal_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alimento VARCHAR(255),
    quantidade DOUBLE,
    unidade VARCHAR(255),
    food_item_id INT,
    snapshot_kcal DOUBLE,
    snapshot_proteina DOUBLE,
    snapshot_carboidrato DOUBLE,
    snapshot_lipideos DOUBLE,
    snapshot_fibra DOUBLE,
    meal_id INT,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_meal_item_refeicao FOREIGN KEY (meal_id) REFERENCES refeicao(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de histórico de paciente
CREATE TABLE IF NOT EXISTS historico_paciente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT,
    dados_antropometricos_id INT,
    dados_circunferencia_id INT,
    data_consulta DATE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_historico_paciente FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    CONSTRAINT fk_historico_antropometrico FOREIGN KEY (dados_antropometricos_id) REFERENCES dados_antropometricos(id_dados_antropometricos),
    CONSTRAINT fk_historico_circunferencia FOREIGN KEY (dados_circunferencia_id) REFERENCES dados_circunferencia(id_dados_circunferencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nota: a tabela 'alimentos' é criada pelo script 01-alimentos.sql no Docker init
-- e contém os dados TACO. Não recriamos aqui para evitar conflito.
