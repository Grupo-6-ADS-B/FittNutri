USE fittnutri;

START TRANSACTION;

-- ============================================================
-- DIETAS MODELO EXTRAÍDAS DOS PLANOS ALIMENTARES (8 MODELOS TOTAL)
-- ============================================================

-- ============================================================
-- DIETAS MODELO EXTRAÍDAS DOS 4 PLANOS ALIMENTARES
-- 1. Dieta para paciente feminina que toma monjaro
-- 2. Dieta para pré-diabetes, paciente masculino
-- 3. Dieta para obesidade
-- 4. Dieta para lipedema
-- ============================================================


-- ============================================================
-- DIETA PARA PACIENTE FEMININA QUE TOMA MONJARO
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta para paciente feminina que toma monjaro',
    'Modelo baseado no plano alimentar de Angélica Almeida da Purificação Alves.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 08:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '08:30:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Ovo%galinha%cozido%' OR nome LIKE '%Ovo%cozido%' LIMIT 1),
    'Ovo, galinha, inteiro, cozido, mexido',
    2.00,
    'unidades',
    'Unidades grandes (122 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Pêra%' OR nome LIKE '%Pera%' LIMIT 1),
    'Pera, crua',
    1.00,
    'unidade',
    'Unidade média (178 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Café%infusão%' OR nome LIKE '%Café%' LIMIT 1),
    'Café, infusão 10%',
    1.00,
    'copo',
    'Copo pequeno (50 g)'
);

-- Almoço - 13:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '13:30:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Arroz%integral%cozido%' LIMIT 1),
    'Arroz integral cozido',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Lentilha%cozida%' LIMIT 1),
    'Lentilha cozida',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Legumes Assados Leves e Saudáveis',
    90.00,
    'g',
    'Receita da Nutri Jane'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Frango%peito%cozido%' OR nome LIKE '%Frango%cozido%' LIMIT 1),
    'Peito de frango cozido desfiado',
    100.00,
    'g',
    'Receita da Nutri Jane'
);

-- Lanche da tarde - 16:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '16:00:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Receita de Pão Proteico da Nutri Jane Gonzalez',
    2.00,
    'unidades',
    '100 g'
),
(
    @refeicao_id,
    NULL,
    'Queijo ricota light',
    40.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Laranja%pêra%' OR nome LIKE '%Laranja%pera%' LIMIT 1),
    'Laranja pêra crua',
    1.00,
    'unidade',
    'Unidade pequena (90 g)'
),
(
    @refeicao_id,
    NULL,
    'Chá de erva-doce, infusão 5%',
    70.00,
    'g',
    NULL
);

-- Jantar - 20:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '20:00:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Arroz%integral%cozido%' LIMIT 1),
    'Arroz integral cozido',
    60.00,
    'g',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Legumes Assados Leves e Saudáveis',
    90.00,
    'g',
    'Receita da Nutri Jane'
),
(
    @refeicao_id,
    NULL,
    'Salada de quinoa',
    50.00,
    'g',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Tilápia assada',
    100.00,
    'g',
    'Receita da Nutri Jane'
);


-- ============================================================
-- DIETA PARA PRÉ-DIABETES, PACIENTE MASCULINO
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta para pré-diabetes, paciente masculino',
    'Modelo baseado no plano alimentar de José Milton dos Santos.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 07:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '07:00:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Receita da Nutri Jane Suco verde para Diabetes',
    1.00,
    'porção',
    '300 g'
),
(
    @refeicao_id,
    NULL,
    'Receita de Pão Proteico da Nutri Jane Gonzalez',
    2.00,
    'unidades',
    '100 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Café%infusão%' OR nome LIKE '%Café%' LIMIT 1),
    'Café, infusão 10%',
    1.00,
    'copo',
    'Copo pequeno cheio (165 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Melão%cru%' OR nome LIKE '%Melão%' LIMIT 1),
    'Melão cru',
    1.00,
    'fatia',
    'Fatia grande (115 g)'
);

-- Almoço - 13:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '13:00:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Rúcula%crua%' OR nome LIKE '%Rúcula%' LIMIT 1),
    'Rúcula crua',
    1.00,
    'prato',
    'Prato de sobremesa (60 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Cenoura%crua%' OR nome LIKE '%Cenoura%' LIMIT 1),
    'Cenoura ralada crua',
    2.00,
    'colheres de sopa',
    '24 g'
),
(
    @refeicao_id,
    NULL,
    'Salada de quinoa',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Arroz%integral%cozido%' LIMIT 1),
    'Arroz integral cozido',
    3.00,
    'colheres de sopa cheias',
    '60 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Feijão%carioca%cozido%' LIMIT 1),
    'Feijão carioca cozido',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Frango%peito%assado%' OR nome LIKE '%Frango%assado%' LIMIT 1),
    'Peito de frango, sem pele, assado',
    1.00,
    'peito',
    'Peito pequeno (140 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Laranja%pêra%' OR nome LIKE '%Laranja%pera%' LIMIT 1),
    'Laranja pêra crua',
    1.00,
    'unidade',
    'Unidade pequena (90 g)'
);

-- Lanche da tarde - 16:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '16:00:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Maçã%Fuji%' OR nome LIKE '%Maçã%' LIMIT 1),
    'Maçã Fuji com casca crua',
    1.00,
    'unidade',
    'Unidade pequena (80 g)'
),
(
    @refeicao_id,
    NULL,
    'Torta de Frango Nutri Jane',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Chá de erva-doce, infusão 5%',
    1.00,
    'xícara',
    '200 g'
);

-- Jantar - 19:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '19:00:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Salada de quinoa',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Alface%americana%' OR nome LIKE '%Alface%' LIMIT 1),
    'Alface americana crua',
    1.00,
    'prato',
    'Prato raso cheio, picada (80 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Cenoura%crua%' OR nome LIKE '%Cenoura%' LIMIT 1),
    'Cenoura ralada crua',
    2.00,
    'colheres de sopa cheias',
    '24 g'
),
(
    @refeicao_id,
    NULL,
    'Legumes Assados Leves e Saudáveis',
    1.00,
    'porção',
    '190 g - Receita da Nutri Jane'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Sardinha%assada%' OR nome LIKE '%Sardinha%' LIMIT 1),
    'Sardinha assada',
    3.00,
    'unidades grandes',
    '120 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Goiaba%vermelha%' OR nome LIKE '%Goiaba%' LIMIT 1),
    'Goiaba vermelha com casca crua',
    1.00,
    'unidade',
    'Unidade pequena (170 g)'
);


-- ============================================================
-- DIETA PARA OBESIDADE
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta para obesidade',
    'Modelo baseado no plano alimentar de Samuel Rocha Chaves.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 06:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '06:00:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Pão Proteico',
    2.00,
    'unidades',
    '100 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Leite%desnatado%' OR nome LIKE '%Leite%' LIMIT 1),
    'Leite de vaca desnatado',
    150.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Café%infusão%' OR nome LIKE '%Café%' LIMIT 1),
    'Café, infusão 10%',
    150.00,
    'g',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Queijo ricota light',
    50.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Pêra%' OR nome LIKE '%Pera%' LIMIT 1),
    'Pera, crua',
    1.00,
    'unidade',
    'Unidade média (110 g)'
);

-- Almoço - 13:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '13:00:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Alface%americana%' OR nome LIKE '%Alface%' LIMIT 1),
    'Alface americana crua',
    1.00,
    'prato',
    'Prato raso cheio, picada (80 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Tomate%semente%' OR nome LIKE '%Tomate%' LIMIT 1),
    'Tomate com semente cru',
    4.00,
    'fatias',
    'Fatias médias (60 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Cenoura%crua%' OR nome LIKE '%Cenoura%' LIMIT 1),
    'Cenoura ralada crua',
    2.00,
    'colheres de sopa cheias',
    '24 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Chuchu%cozido%' OR nome LIKE '%Chuchu%' LIMIT 1),
    'Chuchu cozido',
    2.00,
    'colheres de arroz',
    '90 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Abóbora%caboti%' OR nome LIKE '%Abóbora%' LIMIT 1),
    'Abóbora cabotiá cozida',
    2.00,
    'colheres de sopa cheias',
    '72 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Arroz%integral%cozido%' LIMIT 1),
    'Arroz integral cozido',
    3.00,
    'colheres de sopa cheias',
    '60 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Feijão%carioca%cozido%' LIMIT 1),
    'Feijão carioca cozido',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Sardinha%assada%' OR nome LIKE '%Sardinha%' LIMIT 1),
    'Sardinha assada',
    4.00,
    'unidades grandes',
    '160 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Abacaxi%cru%' OR nome LIKE '%Abacaxi%' LIMIT 1),
    'Abacaxi cru',
    1.00,
    'fatia',
    'Fatia média (75 g)'
);

-- Lanche da tarde - 16:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '16:00:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Gelatina Proteica',
    1.00,
    'porção',
    '180 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Melão%cru%' OR nome LIKE '%Melão%' LIMIT 1),
    'Melão cru',
    1.00,
    'fatia',
    'Fatia grande (115 g)'
);

-- Jantar - 20:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '20:00:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Salada de quinoa',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Arroz%integral%cozido%' LIMIT 1),
    'Arroz integral cozido',
    60.00,
    'g',
    '3 colheres de sopa cheias'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Chuchu%cozido%' OR nome LIKE '%Chuchu%' LIMIT 1),
    'Chuchu cozido',
    80.00,
    'g',
    '4 colheres de sopa cheias'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Frango%peito%assado%' OR nome LIKE '%Frango%assado%' LIMIT 1),
    'Peito pequeno de frango, sem pele, assado',
    140.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Laranja%lima%' OR nome LIKE '%Laranja%' LIMIT 1),
    'Laranja lima crua',
    1.00,
    'unidade',
    'Unidade pequena (90 g)'
);


-- ============================================================
-- DIETA PARA LIPEDEMA
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta para lipedema',
    'Modelo baseado no plano alimentar de Vaneide Marques da Rocha Chaves.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 05:40
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '05:40:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Suco verde',
    1.00,
    'porção',
    '280 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Morango%cru%' OR nome LIKE '%Morango%' LIMIT 1),
    'Morango cru',
    8.00,
    'unidades',
    'Unidades pequenas (56 g)'
),
(
    @refeicao_id,
    NULL,
    'Pão Proteico',
    2.00,
    'unidades',
    '100 g'
);

-- Almoço - 12:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '12:00:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Abóbora%caboti%' OR nome LIKE '%Abóbora%' LIMIT 1),
    'Abóbora cabotiá cozida',
    1.00,
    'escumadeira média cheia',
    '100 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Alface%americana%' OR nome LIKE '%Alface%' LIMIT 1),
    'Alface americana crua',
    1.00,
    'prato raso cheio',
    'Picada (80 g)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Tomate%semente%' OR nome LIKE '%Tomate%' LIMIT 1),
    'Tomate com semente cru',
    4.00,
    'fatias médias',
    '60 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Agrião%cru%' OR nome LIKE '%Agrião%' LIMIT 1),
    'Agrião cru',
    5.00,
    'ramos médios',
    '25 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Azeite%oliva%' OR nome LIKE '%Azeite%' LIMIT 1),
    'Azeite de oliva extra virgem',
    1.00,
    'colher de café',
    '1 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Arroz%integral%cozido%' LIMIT 1),
    'Arroz integral cozido',
    1.00,
    'colher de arroz cheia',
    '63 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Lentilha%cozida%' LIMIT 1),
    'Lentilha cozida',
    4.00,
    'colheres de sopa',
    '72 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Sardinha%assada%' OR nome LIKE '%Sardinha%' LIMIT 1),
    'Sardinha assada',
    4.00,
    'unidades grandes',
    '160 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Abacaxi%cru%' OR nome LIKE '%Abacaxi%' LIMIT 1),
    'Abacaxi cru',
    1.00,
    'fatia',
    'Fatia média (75 g)'
);

-- Lanche da tarde - 15:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '15:00:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Chá de Hibisco e Cavalinha',
    1.00,
    'xícara',
    '238 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Maçã%Fuji%' OR nome LIKE '%Maçã%' LIMIT 1),
    'Maçã Fuji com casca crua',
    1.00,
    'unidade',
    'Unidade pequena (80 g)'
),
(
    @refeicao_id,
    NULL,
    'Torta de Frango Nutri Jane',
    100.00,
    'g',
    NULL
);

-- Jantar - 20:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '20:00:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Cenoura%cozida%' OR nome LIKE '%Cenoura%' LIMIT 1),
    'Cenoura cozida picada',
    2.00,
    'colheres de arroz',
    '80 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Chuchu%cozido%' OR nome LIKE '%Chuchu%' LIMIT 1),
    'Chuchu cozido picado',
    3.00,
    'colheres de arroz',
    '135 g'
),
(
    @refeicao_id,
    NULL,
    'Salada de quinoa',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Frango%peito%assado%' OR nome LIKE '%Frango%assado%' LIMIT 1),
    'Peito pequeno de frango assado',
    140.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome LIKE '%Goiaba%vermelha%' OR nome LIKE '%Goiaba%' LIMIT 1),
    'Goiaba vermelha com casca crua',
    1.00,
    'unidade',
    'Unidade pequena (170 g)'
);

-- ============================================================
-- DIETAS MODELO EXTRAÍDAS DOS PLANOS ALIMENTARES
-- Fonte: PDFs de Tamara, Jessica Lucy, Lara Fabia e Eunice.
-- ============================================================

-- ============================================================
-- DIETA PARA GORDURA NO FÍGADO
-- ============================================================
INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta para gordura no fígado',
    'Modelo baseado no plano alimentar de Tamara Alcantra Bittencourt.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 08:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '08:00:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Suco verde',
    1.00,
    'porção',
    'Ingredientes: Couve, Pepino, Água, Glutamina em pó. Tomar em jejum.'
),
(
    @refeicao_id,
    NULL,
    'Omelete',
    1.00,
    'porção',
    '2 Ovos inteiros, 40g Cenoura ralada, 1 Tomate picado sem semente, temperos'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Iogurte, natural, desnatado' LIMIT 1),
    'Iogurte natural desnatado Nestlé',
    160.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Aveia, flocos, crua' LIMIT 1),
    'Aveia em flocos',
    30.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Mamão, Formosa, cru' LIMIT 1),
    'Mamão picado',
    200.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Café, infusão 10%' LIMIT 1),
    'Café sem açúcar',
    150.00,
    'ml',
    'Com adoçante sucralose Zero Cal'
);

-- Almoço - 11:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '11:30:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Arroz, integral, cozido' LIMIT 1),
    'Arroz integral cozido',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Feijão, carioca, cozido' LIMIT 1),
    'Feijão cozido com caldo',
    80.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Frango, peito, sem pele, grelhado' LIMIT 1),
    'Filé de peito de frango grelhado',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Abobrinha, italiana, cozida' LIMIT 1),
    'Abobrinha e brócolis cozidos no vapor',
    180.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, americana, crua' LIMIT 1),
    'Alface americana',
    1.00,
    'prato raso',
    'Salada à vontade'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate',
    1.00,
    'unidade média',
    'Temperar salada com 1/2 colher de sopa de azeite e sal à gosto'
);

-- Lanche - 14:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '14:30:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Whey 3w Vitafor',
    31.00,
    'g',
    'Bater tudo no liquidificador com 250ml de água'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Banana, prata, crua' LIMIT 1),
    'Banana prata picada',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Aveia, flocos, crua' LIMIT 1),
    'Aveia em flocos',
    40.00,
    'g',
    NULL
);

-- Jantar - 18:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '18:30:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Arroz, integral, cozido' LIMIT 1),
    'Arroz integral cozido',
    120.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Frango, peito, sem pele, grelhado' LIMIT 1),
    'Filé de peito de frango grelhado',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Abobrinha, italiana, cozida' LIMIT 1),
    'Abobrinha e brócolis cozidos no vapor',
    200.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, americana, crua' LIMIT 1),
    'Alface americana',
    1.00,
    'prato raso',
    'Salada à vontade'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate',
    1.00,
    'unidade média',
    'Temperar salada com 1/2 colher de sopa de azeite e sal à gosto'
);

-- Ceia - 21:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '21:30:00', 'Ceia', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Chá calmante sem açúcar (Camomila, Melissa, Erva-doce, Erva-Cidreira)',
    250.00,
    'ml',
    NULL
);

-- ============================================================
-- DIETA PARA REEDUCAÇÃO ALIMENTAR E ANEMIA FERROPRIVA
-- ============================================================
INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta para reeducação alimentar e anemia ferropriva',
    'Modelo baseado no plano alimentar de Jessica Lucy de Albuquerque.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 09:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '09:00:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Crepioca de banana',
    155.00,
    'g',
    'Receita com ovo, banana, aveia em flocos e tapioca'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Iogurte, natural, desnatado' LIMIT 1),
    'Iogurte natural desnatado Nestlé',
    160.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Morango, cru' LIMIT 1),
    'Morango cru',
    6.00,
    'unidades pequenas',
    '42 g'
);

-- Lanche da manhã - 12:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '12:00:00', 'Lanche da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Ameixa, preta, crua' LIMIT 1),
    'Ameixa preta fresca crua',
    1.00,
    'unidade grande',
    '52 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Castanha-do-Brasil, crua' LIMIT 1),
    'Castanha-do-Brasil crua',
    4.00,
    'unidades',
    '16 g'
);

-- Almoço - 14:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '14:00:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Frango, peito, sem pele, grelhado' LIMIT 1),
    'Frango grelhado',
    60.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Feijão, carioca, cozido' LIMIT 1),
    'Feijão carioca cozido',
    80.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Arroz, integral, cozido' LIMIT 1),
    'Arroz integral cozido',
    80.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Laranja, pêra, crua' LIMIT 1),
    'Laranja média',
    1.00,
    'unidade média',
    '180 g (ou 125g de goiaba / 160g de mexerica)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Beterraba, cozida' LIMIT 1),
    'Beterraba cozida',
    80.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Couve, manteiga, refogada' LIMIT 1),
    'Couve manteiga refogada',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, roxa, crua' LIMIT 1),
    'Alface roxa crua picada',
    1.00,
    'prato raso cheio',
    '80 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate com semente cru',
    1.00,
    'unidade média',
    '100 g'
);

-- Lanche da tarde - 17:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '17:00:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Torta de Frango Nutri Jane',
    130.00,
    'g',
    'Receita da Nutri Jane'
),
(
    @refeicao_id,
    NULL,
    'Chá de camomila, infusão',
    1.00,
    'xícara de chá',
    '237 g'
);

-- Jantar - 19:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '19:30:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Merluza, filé, assado' LIMIT 1),
    'Filé de merluza assado',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Arroz, integral, cozido' LIMIT 1),
    'Arroz integral cozido',
    80.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Beterraba, cozida' LIMIT 1),
    'Beterraba cozida',
    90.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Couve, manteiga, refogada' LIMIT 1),
    'Couve manteiga refogada',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Abacaxi, cru' LIMIT 1),
    'Abacaxi',
    1.00,
    'fatia média',
    '75 g (ou 53g de goiaba / 68g de mexerica)'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, roxa, crua' LIMIT 1),
    'Alface roxa crua picada',
    1.00,
    'prato raso cheio',
    '80 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate',
    1.00,
    'unidade média',
    '100 g'
);

-- Ceia - 22:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '22:30:00', 'Ceia', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Kiwi, cru' LIMIT 1),
    'Kiwi cru',
    2.00,
    'unidades médias',
    '152 g'
);

-- ============================================================
-- PLANO ALIMENTAR FEMENINO, ECTOMORFO - HIPERTROFIA
-- ============================================================
INSERT INTO dietas (nome, observacao)
VALUES (
    'Plano Alimentar femenino, ectomorfo - hipertrofia',
    'Modelo baseado no plano alimentar de Lara Fabia dos Santos Silva.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 07:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '07:30:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Pão, forma, integral' LIMIT 1),
    'Pão integral',
    2.00,
    'fatias',
    '50 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Ovo, de galinha, inteiro, cozido/10minutos' LIMIT 1),
    'Ovo mexido',
    2.00,
    'unidades',
    '92 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Manga, Palmer, crua' LIMIT 1),
    'Manga picada',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Aveia, flocos, crua' LIMIT 1),
    'Aveia',
    15.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Café, infusão 10%' LIMIT 1),
    'Café sem açúcar',
    1.00,
    'xícara',
    '200 ml'
);

-- Colação - 10:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '10:30:00', 'Colação', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Iogurte, natural, integral' LIMIT 1),
    'Iogurte integral Nestlé',
    170.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Castanha-do-Brasil, crua' LIMIT 1),
    'Castanha do Pará',
    4.00,
    'unidades',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Banana, prata, crua' LIMIT 1),
    'Banana prata picada',
    1.00,
    'unidade média',
    '65 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Aveia, flocos, crua' LIMIT 1),
    'Aveia',
    15.00,
    'g',
    NULL
);

-- Almoço - 12:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '12:00:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Arroz, integral, cozido' LIMIT 1),
    'Arroz integral cozido',
    4.00,
    'colheres de sopa',
    '80 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Feijão, carioca, cozido' LIMIT 1),
    'Feijão com caldo',
    1.00,
    'concha média',
    '80 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Frango, peito, sem pele, grelhado' LIMIT 1),
    'Filé de peito de frango grelhado',
    60.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Batata, doce, cozida' LIMIT 1),
    'Batata-doce cozida',
    100.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Brócolis, cozido' LIMIT 1),
    'Brócolis cozido',
    3.00,
    'colheres de sopa',
    '30 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Laranja, pêra, crua' LIMIT 1),
    'Laranja pequena',
    1.00,
    'unidade',
    '90 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, americana, crua' LIMIT 1),
    'Alface',
    0.50,
    'prato raso',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate',
    1.00,
    'unidade',
    '50 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Cenoura, crua' LIMIT 1),
    'Cenoura ralada',
    2.00,
    'colheres de sopa',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Azeite de oliva extra virgem',
    1.00,
    'colher de sopa',
    '8 g'
);

-- Lanche - 16:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '16:00:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Hipercalórico Max Titanium (Morango)',
    100.00,
    'g',
    'Bater no liquidificador com 200ml de água'
);

-- Jantar - 20:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '20:00:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Frango, peito, sem pele, grelhado' LIMIT 1),
    'Filé de peito de frango grelhado',
    60.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Batata, doce, cozida' LIMIT 1),
    'Batata-doce cozida',
    140.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Brócolis, cozido' LIMIT 1),
    'Brócolis cozido',
    3.00,
    'colheres de sopa',
    '30 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, americana, crua' LIMIT 1),
    'Alface',
    0.50,
    'prato raso',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate',
    1.00,
    'unidade',
    '50 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Cenoura, crua' LIMIT 1),
    'Cenoura ralada',
    2.00,
    'colheres de sopa',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Azeite de oliva extra virgem',
    1.00,
    'colher de sopa',
    '8 g'
);

-- Ceia - 22:30
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '22:30:00', 'Ceia', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Hipercalórico Max Titanium (Morango)',
    80.00,
    'g',
    'Bater no liquidificador com 150ml de água'
);

-- ============================================================
-- PLANO ALIMENTAR FEMININO - FERRITINA ALTA
-- ============================================================
INSERT INTO dietas (nome, observacao)
VALUES (
    'Plano Alimentar feminino - ferritina alta',
    'Modelo baseado no plano alimentar de Eunice Oliveira dos Santos.'
);

SET @dieta_id = LAST_INSERT_ID();

-- Café da manhã - 08:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '08:00:00', 'Café da manhã', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Ovo, de galinha, inteiro, cozido/10minutos' LIMIT 1),
    'Ovos mexidos (com tomate e cebola)',
    2.00,
    'unidades',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Aveia, flocos, crua' LIMIT 1),
    'Aveia flocos grossos',
    1.00,
    'colher de sopa',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Melancia, crua' LIMIT 1),
    'Melancia',
    1.00,
    'fatia média',
    '150 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Café, infusão 10%' LIMIT 1),
    'Café sem açúcar',
    200.00,
    'ml',
    'Com adoçante sucralose'
);

-- Colação - 11:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '11:00:00', 'Colação', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Iogurte light',
    170.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Maçã, Fuji, com casca, crua' LIMIT 1),
    'Maçã picada',
    1.00,
    'unidade',
    '130 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Castanha-do-Brasil, crua' LIMIT 1),
    'Castanha do Pará',
    4.00,
    'unidades',
    NULL
);

-- Almoço - 13:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '13:00:00', 'Almoço', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Arroz, integral, cozido' LIMIT 1),
    'Arroz integral cozido',
    5.00,
    'colheres de sopa',
    '100 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Feijão, carioca, cozido' LIMIT 1),
    'Feijão com caldo',
    1.00,
    'concha média',
    '80 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Frango, peito, sem pele, grelhado' LIMIT 1),
    'Peito de frango grelhado',
    120.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Acelga, crua' LIMIT 1),
    'Acelga refogada com pouco óleo',
    1.00,
    'colher grande de servir cheia',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, americana, crua' LIMIT 1),
    'Alface',
    1.00,
    'prato',
    'Salada à vontade'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate médio',
    1.00,
    'unidade',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Pepino, cru' LIMIT 1),
    'Pepino',
    0.33,
    'unidade',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Chá escuro (preto, mate ou verde) sem açúcar',
    200.00,
    'ml',
    NULL
);

-- Lanche - 16:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '16:00:00', 'Lanche da tarde', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Crepioca de banana',
    1.00,
    'unidade',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Café, infusão 10%' LIMIT 1),
    'Café sem açúcar',
    200.00,
    'ml',
    'Com adoçante sucralose'
);

-- Jantar - 19:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '19:00:00', 'Jantar', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Arroz, integral, cozido' LIMIT 1),
    'Arroz integral',
    5.00,
    'colheres de sopa',
    '100 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Merluza, filé, assado' LIMIT 1),
    'Filé de Merluza assado (com pouco óleo)',
    120.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Chuchu, cozido' LIMIT 1),
    'Mix: chuchu e cenoura cozidos',
    70.00,
    'g',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Alface, americana, crua' LIMIT 1),
    'Alface',
    1.00,
    'prato',
    'Salada à vontade'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Tomate, com semente, cru' LIMIT 1),
    'Tomate médio',
    1.00,
    'unidade',
    NULL
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Pepino, cru' LIMIT 1),
    'Pepino',
    0.33,
    'unidade',
    NULL
),
(
    @refeicao_id,
    NULL,
    'Chá escuro (preto, mate ou verde) sem açúcar',
    200.00,
    'ml',
    NULL
);

-- Ceia - 22:00
INSERT INTO dieta_refeicoes (dieta_id, horario, nome, observacao)
VALUES (@dieta_id, '22:00:00', 'Ceia', NULL);

SET @refeicao_id = LAST_INSERT_ID();

INSERT INTO dieta_refeicao_itens
    (refeicao_id, alimento_id, descricao, quantidade, unidade, observacao)
VALUES
(
    @refeicao_id,
    NULL,
    'Shake: Whey 3w Vitafor',
    1.00,
    'dose',
    '31g. Bater no liquidificador com 200ml de água, leite vegetal sem açúcar ou leite desnatado'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Banana, prata, crua' LIMIT 1),
    'Banana prata',
    1.00,
    'unidade',
    '60 g'
),
(
    @refeicao_id,
    (SELECT id FROM alimentos WHERE nome = 'Aveia, flocos, crua' LIMIT 1),
    'Aveia',
    1.00,
    'colher de sopa',
    '15 g'
);

COMMIT;
