USE fittnutri;

START TRANSACTION;

-- ============================================================
-- DIETAS MODELO EXTRAÍDAS DOS 4 PLANOS ALIMENTARES
-- 1. Dieta modelo - Angélica
-- 2. Dieta modelo - José Milton
-- 3. Dieta modelo - Samuel
-- 4. Dieta modelo - Vaneide
-- ============================================================


-- ============================================================
-- DIETA MODELO - ANGÉLICA
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta modelo - Angélica',
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
-- DIETA MODELO - JOSÉ MILTON
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta modelo - José Milton',
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
-- DIETA MODELO - SAMUEL
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta modelo - Samuel',
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
-- DIETA MODELO - VANEIDE
-- ============================================================

INSERT INTO dietas (nome, observacao)
VALUES (
    'Dieta modelo - Vaneide',
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

COMMIT;