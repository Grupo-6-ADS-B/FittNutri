"""
Testes do ETL (tratamento.py).

Como rodar (a partir da pasta dados/ETL):
    pip install -r requirements-dev.txt
    python -m pytest tests -q

Os testes da primeira parte usam dados inventados (rápidos). Os da última parte ("integração")
leem os arquivos reais (TACO, IBGE, medidas) e levam alguns segundos.
"""
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import tratamento as t  # noqa: E402


def linha(**campos):
    """Um alimento de mentira com todas as colunas que o ETL usa (o que não for passado fica vazio)."""
    base = {c: np.nan for c in t.COLUNAS_ALIMENTOS[1:] + t.COLUNAS_MEDIDAS}
    base.update({c: None for c in t.COLUNAS_ORIGEM})
    base.update({"fonte": "TACO", "nome": "Alimento", "grupo": None, "codigo_origem": 1, "codigo_preparacao": np.nan})
    base.update(campos)
    return base


def tabela(*linhas):
    return pd.DataFrame(list(linhas))


# --- leitura e limpeza --------------------------------------------------------------------

@pytest.mark.parametrize("entrada, esperado", [
    ("Tr", np.nan), ("*", np.nan), ("NA", np.nan), ("-", np.nan), ("", np.nan), (" ", np.nan),
    (",0,02", 0.02), ("1,5", 1.5), ("12", 12.0), (3.5, 3.5),
])
def test_limpar_valor(entrada, esperado):
    resultado = t.limpar_valor(entrada)
    if isinstance(esperado, float) and np.isnan(esperado):
        assert pd.isna(resultado)
    else:
        assert resultado == pytest.approx(esperado)


def test_sem_acento_e_parece_po():
    assert t.sem_acento("Hortaliças, Óleo") == "hortalicas, oleo"
    assert t.parece_po("Leite, de vaca, integral, pó")
    assert t.parece_po("Leite em po desnatado")
    assert not t.parece_po("Leite, de vaca, integral")
    assert not t.parece_po("Pompom")  # "po" só vale como palavra inteira


def test_corrigir_negativos_pequenos_e_validar():
    df = tabela(linha(nome="A", carboidrato=-0.03), linha(nome="B", carboidrato=-5.0), linha(nome="C", carboidrato=10.0))
    df, corrigidos = t.corrigir_negativos_pequenos(df)
    assert df.loc[0, "carboidrato"] == 0.0           # resíduo de arredondamento vira 0
    assert df.loc[1, "carboidrato"] == -5.0          # negativo grande continua
    assert [c[1] for c in corrigidos] == ["A"]
    erros, _ = t.validar_dados(df)
    assert any("negativo" in e for e in erros)       # e é barrado pela validação


def test_validar_dados_nome_repetido():
    df = tabela(linha(nome="Arroz", energia_kcal=100), linha(nome="Arroz", energia_kcal=100))
    erros, _ = t.validar_dados(df)
    assert any("repetidos" in e for e in erros)


def test_validar_dados_alertas_nao_viram_erro():
    df = tabela(linha(nome="Estranho", energia_kcal=990, proteina=50, lipideos=50, carboidrato=50))
    erros, alertas = t.validar_dados(df)
    assert erros == []
    assert len(alertas) >= 2   # kcal alta e macros somando mais de 100 g


# --- medidas: origem, limites e camadas ---------------------------------------------------

def test_fonte_geral_pega_a_menos_confiavel():
    ok = linha(gramas_colher_sopa=10, origem_gramas_colher_sopa=t.FONTE_IBGE,
               gramas_xicara=200, origem_gramas_xicara=t.FONTE_ESTIMADO)
    assert t.fonte_geral(pd.Series(ok)) == t.FONTE_ESTIMADO
    so_real = linha(gramas_unidade=50, origem_gramas_unidade=t.FONTE_MAPEADO)
    assert t.fonte_geral(pd.Series(so_real)) == t.FONTE_MAPEADO
    assert t.fonte_geral(pd.Series(linha())) is None


def test_descartar_medidas_implausiveis():
    df = tabela(
        linha(nome="Tapioca", gramas_colher_cha=110, origem_gramas_colher_cha=t.FONTE_IBGE),   # absurdo
        linha(nome="Oregano", gramas_colher_cha=0.04, origem_gramas_colher_cha=t.FONTE_IBGE),  # baixo, mas aceito
        linha(nome="Zero", gramas_colher_sopa=0, origem_gramas_colher_sopa=t.FONTE_IBGE),      # inválido
    )
    limpo, descartadas = t.descartar_medidas_implausiveis(df)
    assert pd.isna(limpo.loc[0, "gramas_colher_cha"]) and pd.isna(limpo.loc[0, "origem_gramas_colher_cha"])
    assert limpo.loc[1, "gramas_colher_cha"] == 0.04
    assert pd.isna(limpo.loc[2, "gramas_colher_sopa"])
    assert {d[1] for d in descartadas} == {"Tapioca", "Zero"}


def test_mapa_so_preenche_o_que_falta_e_acusa_nome_errado():
    df = tabela(linha(nome="Cenoura, crua", gramas_colher_sopa=99, origem_gramas_colher_sopa=t.FONTE_REF_TACO))
    medidas = pd.DataFrame([{"codigo_origem": 5, "codigo_preparacao": 1, "gramas_unidade": 120.0,
                             "gramas_colher_sopa": 12.0, "gramas_colher_cha": np.nan, "gramas_xicara": np.nan, "gramas_ml": np.nan}])
    mapa = pd.DataFrame([{"taco_nome": "Cenoura, crua", "ibge_codigo_alimento": 5, "ibge_codigo_preparacao": 1}])
    resultado = t.adicionar_medidas_mapeadas(df, medidas, mapa)
    assert resultado.loc[0, "gramas_colher_sopa"] == 99                       # o que já existia não muda
    assert resultado.loc[0, "gramas_unidade"] == 120.0                        # o vazio é preenchido
    assert resultado.loc[0, "origem_gramas_unidade"] == t.FONTE_MAPEADO
    errado = pd.DataFrame([{"taco_nome": "Nao existe", "ibge_codigo_alimento": 5, "ibge_codigo_preparacao": 1}])
    with pytest.raises(AssertionError):
        t.adicionar_medidas_mapeadas(df, medidas, errado)


def test_complementares_nao_sobrescrevem_dado_real_e_acusam_nome_errado():
    df = tabela(linha(nome="Manteiga", gramas_colher_sopa=30, origem_gramas_colher_sopa=t.FONTE_IBGE))
    comp = pd.DataFrame([{"fonte": "TACO", "nome": "Manteiga", "referencia": "teste", "gramas_unidade": np.nan,
                          "gramas_colher_sopa": 20.0, "gramas_colher_cha": 6.0, "gramas_xicara": np.nan, "gramas_ml": np.nan}])
    resultado = t.adicionar_medidas_complementares(df, comp)
    assert resultado.loc[0, "gramas_colher_sopa"] == 30                       # real tem prioridade
    assert resultado.loc[0, "gramas_colher_cha"] == 6.0
    assert resultado.loc[0, "origem_gramas_colher_cha"] == t.FONTE_EXTERNA
    comp.loc[0, "nome"] = "Nao existe"
    with pytest.raises(AssertionError):
        t.adicionar_medidas_complementares(df, comp)


# --- estimativas --------------------------------------------------------------------------

@pytest.mark.parametrize("nome, kcal, fonte, grupo, esperado", [
    ("Óleo, de soja", 884, "TACO", "Gorduras e óleos", t.DENSIDADE_OLEO),
    ("Cana, aguardente 1", 231, "TACO", "Bebidas (alcoólicas e não alcoólicas)", t.DENSIDADE_DESTILADO),
    ("Refrigerante, tipo cola", 34, "TACO", "Bebidas (alcoólicas e não alcoólicas)", t.DENSIDADE_AGUA),
    ("Leite, de vaca, integral", np.nan, "TACO", "Leite e derivados", t.DENSIDADE_AGUA),   # sem kcal na TACO
    ("Leite, de vaca, integral, pó", np.nan, "TACO", "Leite e derivados", None),            # pó não é líquido
    ("Leite, condensado", 321, "TACO", "Leite e derivados", None),                           # muitas calorias
    ("Queijo, mozarela", 330, "TACO", "Leite e derivados", None),
    ("Arroz, integral, cozido", 124, "TACO", "Cereais e derivados", None),
])
def test_densidade_liquido(nome, kcal, fonte, grupo, esperado):
    resultado = t.densidade_liquido(pd.Series(linha(nome=nome, energia_kcal=kcal, fonte=fonte, grupo=grupo)))
    assert resultado == esperado


def _ibge_com_colher(grupo_prefixo, valores):
    return pd.DataFrame([linha(fonte="IBGE", nome=f"item {i}", codigo_origem=int(f"{grupo_prefixo}00{i:03d}"),
                               gramas_colher_sopa=v) for i, v in enumerate(valores)])


def test_calcular_medianas_exige_quantidade_e_homogeneidade():
    homogeneo = _ibge_com_colher("71", [24, 25, 25, 26, 25, 24])          # carnes, valores parecidos
    assert t.calcular_medianas(homogeneo)[("carnes", "gramas_colher_sopa")][0] == 25
    poucos = _ibge_com_colher("71", [24, 25, 26])                          # menos de 5 medidas
    assert t.calcular_medianas(poucos) == {}
    misturado = _ibge_com_colher("71", [5, 10, 25, 40, 60, 80])            # muito espalhado
    assert t.calcular_medianas(misturado) == {}
    liquido_misto = _ibge_com_colher("79", [25, 25, 25, 25, 25, 25])       # laticínios: nunca por mediana
    assert t.calcular_medianas(liquido_misto) == {}


def test_estimar_medidas():
    medianas = {("carnes", "gramas_colher_sopa"): (25.0, 10, 0.2)}
    df = tabela(
        linha(nome="Frango, grelhado", grupo="Carnes e derivados"),
        linha(nome="Café, infusão 10%", grupo="Bebidas (alcoólicas e não alcoólicas)", energia_kcal=9),
        linha(nome="Óleo, de soja", grupo="Gorduras e óleos", energia_kcal=884),
        linha(nome="Carne, em pó", grupo="Carnes e derivados"),
        linha(nome="Peixe", grupo="Pescados e frutos do mar"),
    )
    r = t.estimar_medidas(df, medianas)
    assert r.loc[0, "gramas_colher_sopa"] == 25 and r.loc[0, "origem_gramas_colher_sopa"] == t.FONTE_ESTIMADO
    assert pd.isna(r.loc[0, "gramas_unidade"])                                     # unidade nunca é estimada
    assert (r.loc[1, "gramas_colher_sopa"], r.loc[1, "gramas_xicara"], r.loc[1, "gramas_ml"]) == (15, 200, 1.0)
    assert r.loc[2, "gramas_colher_sopa"] == pytest.approx(13.8) and r.loc[2, "gramas_ml"] == pytest.approx(0.92)
    assert pd.isna(r.loc[3, "gramas_colher_sopa"])                                 # pó não usa a mediana
    assert pd.isna(r.loc[4, "gramas_colher_sopa"])                                 # grupo sem mediana: sem estimativa


def test_estimar_nao_mexe_no_que_ja_tem_valor():
    df = tabela(linha(nome="Leite", grupo="Leite e derivados", energia_kcal=60, gramas_xicara=250,
                      origem_gramas_xicara=t.FONTE_IBGE))
    r = t.estimar_medidas(df, {})
    assert r.loc[0, "gramas_xicara"] == 250 and r.loc[0, "origem_gramas_xicara"] == t.FONTE_IBGE


# --- SQL ----------------------------------------------------------------------------------

def test_valor_sql_escapa_corretamente():
    assert t.valor_sql(None) == "NULL"
    assert t.valor_sql(float("nan")) == "NULL"
    assert t.valor_sql("O'Brien") == "'O''Brien'"
    assert t.valor_sql("a\\b") == "'a\\\\b'"           # barra invertida também é escapada
    assert t.valor_sql(1.23456789) == "1.234568"


def test_renderizar_sql():
    assert t.renderizar_sql("UPDATE x SET a = %s WHERE n = %s", [None, "Pao"]) == "UPDATE x SET a = NULL WHERE n = 'Pao'"
    with pytest.raises(AssertionError):
        t.renderizar_sql("UPDATE x SET a = %s", [1, 2])


def test_montar_comandos_sql():
    df = tabela(
        linha(fonte="TACO", nome="Arroz", umidade=70, energia_kcal=100, medidas_fonte=t.FONTE_IBGE, gramas_colher_sopa=20),
        linha(fonte="IBGE", nome="Arroz", energia_kcal=100, medidas_fonte=None),     # mesmo nome da TACO
        linha(fonte="IBGE", nome="Feijao", energia_kcal=80, medidas_fonte=None),
    )
    df = t.adicionar_valores_por_grama(df)
    colunas_novas, comandos = t.montar_comandos_sql(df)
    assert "medidas_fonte" in colunas_novas
    for sql, parametros in comandos:
        assert sql.count("%s") == len(parametros)                 # nenhum valor vai colado no texto do SQL
    inserts = [p for sql, p in comandos if sql.startswith("INSERT")]
    updates = [p for sql, p in comandos if sql.startswith("UPDATE")]
    assert [(p[0], p[1]) for p in inserts] == [("TACO", "Arroz"), ("IBGE", "Arroz (IBGE)"), ("IBGE", "Feijao")]
    assert len(updates) == 3                                       # TACO também é gravada por inteiro
    assert inserts[0][2] == pytest.approx(0.70)                    # umidade 70% vira fração, como no banco
    assert inserts[0][3] == pytest.approx(1.0)                     # 100 kcal/100 g -> 1 kcal por 1 g


def test_nome_repetido_ignorando_acento_e_barrado():
    df = tabela(linha(nome="Pêra, crua", energia_kcal=50, medidas_fonte=None),
                linha(nome="Pera, crua ", energia_kcal=50, medidas_fonte=None))
    erros, _ = t.validar_dados(df)
    assert any("repetidos" in e for e in erros)                    # o MySQL trataria os dois como o mesmo nome
    with pytest.raises(AssertionError):
        t.montar_comandos_sql(t.adicionar_valores_por_grama(df))


# --- dietas-modelo ------------------------------------------------------------------------

def _dietas(*linhas):
    base = {c: "" for c in t.COLUNAS_DIETAS}
    return pd.DataFrame([{**base, **l} for l in linhas])


def test_validar_dietas():
    ok = _dietas({"dieta": "D1", "horario": "08:30", "refeicao": "Cafe", "descricao": "Pao", "quantidade": "2",
                  "alimento_taco": "Pão, trigo, francês"})
    assert t.validar_dietas(ok, {"Pão, trigo, francês"}) == []
    assert any("não existe" in e for e in t.validar_dietas(ok, {"Outro"}))
    ruim = _dietas({"dieta": "D1", "horario": "8h", "refeicao": "Cafe", "descricao": "Pao", "quantidade": "dois"})
    erros = " ".join(t.validar_dietas(ruim, set()))
    assert "horário" in erros and "quantidade" in erros


def test_montar_comandos_dietas():
    df = _dietas(
        {"dieta": "D1", "dieta_observacao": "obs", "horario": "08:30", "refeicao": "Cafe", "descricao": "Pao",
         "quantidade": "2", "unidade": "unidades", "alimento_taco": "Pão, trigo, francês"},
        {"dieta": "D1", "dieta_observacao": "obs", "horario": "08:30", "refeicao": "Cafe", "descricao": "Cafe",
         "quantidade": "1", "unidade": "copo"},
        {"dieta": "D1", "dieta_observacao": "obs", "horario": "12:00", "refeicao": "Almoco", "descricao": "Arroz",
         "quantidade": "3", "unidade": "colheres"},
        {"dieta": "D2", "horario": "08:00", "refeicao": "Cafe", "descricao": "Leite", "quantidade": "1"},
    )
    comandos = t.montar_comandos_dietas(df)
    textos = [sql for sql, _ in comandos]
    for sql, parametros in comandos:
        assert sql.count("%s") == len(parametros)
    assert sum(s.startswith("INSERT INTO dietas ") for s in textos) == 2              # 2 dietas
    assert sum(s.startswith("INSERT INTO dieta_refeicoes") for s in textos) == 3     # 3 refeições
    assert sum(s.startswith("INSERT INTO dieta_refeicao_itens") for s in textos) == 4  # 4 itens
    # tudo só vale se a dieta é nova (assim rodar de novo não duplica nem desfaz edições)
    assert all("@nova = 1" in s for s in textos if s.startswith("INSERT"))
    primeira_refeicao = next(p for s, p in comandos if s.startswith("INSERT INTO dieta_refeicoes"))
    assert primeira_refeicao[0] == "08:30:00"                                         # horário completo
    primeiro_item = next(p for s, p in comandos if s.startswith("INSERT INTO dieta_refeicao_itens"))
    assert primeiro_item[0] == "Pão, trigo, francês" and primeiro_item[2] == 2.0
    sem_alimento = [p for s, p in comandos if s.startswith("INSERT INTO dieta_refeicao_itens")][1]
    assert sem_alimento[0] is None                                                    # item sem alimento ligado


# --- integração: arquivos reais -----------------------------------------------------------

@pytest.fixture(scope="module")
def resultado():
    return t.processar()


def test_integracao_quantidades(resultado):
    df = resultado["alimentos"]
    assert (df["fonte"] == "TACO").sum() == 597
    assert (df["fonte"] == "IBGE").sum() == 1971


def test_integracao_nomes_unicos_por_fonte(resultado):
    df = resultado["alimentos"]
    for _, parte in df.groupby("fonte"):
        assert not parte["nome"].duplicated().any()


def test_integracao_mapa_e_complementares_referenciam_alimentos_que_existem(resultado):
    df = resultado["alimentos"]
    existentes = set(zip(df["fonte"], df["nome"]))
    comp = resultado["complementares"]
    assert all((f, n) in existentes for f, n in zip(comp["fonte"], comp["nome"]))
    assert set(resultado["mapa"]["taco_nome"]) <= set(df.loc[df["fonte"] == "TACO", "nome"])


def test_integracao_medidas_coerentes(resultado):
    df = resultado["alimentos"]
    for medida, maximo in t.LIMITE_MAXIMO_MEDIDA.items():
        assert (df[medida].dropna() > 0).all()
        assert (df[medida].dropna() <= maximo).all()
    # toda medida preenchida tem origem, e toda origem tem medida
    for medida in t.COLUNAS_MEDIDAS:
        assert (df[medida].notna() == df[f"origem_{medida}"].notna()).all()
    # "unidade" nunca é estimada
    assert not (df["origem_gramas_unidade"] == t.FONTE_ESTIMADO).any()
    # medidas_fonte só tem valores conhecidos e cabe na coluna do banco (VARCHAR(20))
    valores = set(df["medidas_fonte"].dropna())
    assert valores <= set(t.ORDEM_CONFIANCA)
    assert max(len(v) for v in valores) <= 20


def test_integracao_valores_por_grama(resultado):
    df = resultado["alimentos"]
    arroz = df[(df["fonte"] == "TACO") & (df["nome"] == "Arroz, integral, cozido")].iloc[0]
    assert arroz["energia_kcal_1g"] == pytest.approx(arroz["energia_kcal"] / 100)
    assert arroz["energia_kcal_1g"] == pytest.approx(1.2353, abs=1e-3)   # 123,53 kcal/100 g -> 1,2353 kcal/g


def test_integracao_comandos_sql_consistentes(resultado):
    _, comandos = t.montar_comandos_sql(resultado["alimentos"])
    for sql, parametros in comandos:
        assert sql.count("%s") == len(parametros)
    assert len(comandos) == 2 * (597 + 1971)   # um INSERT e um UPDATE para cada alimento (TACO e IBGE)


# Ligações que não repetem o nome, mas são aproximações aceitas (o alimento exato não existe na TACO)
APROXIMACOES_ACEITAS = {
    ("Peito de frango, sem pele, assado", "Frango, inteiro, sem pele, assado"),
    ("Peito pequeno de frango, sem pele, assado", "Frango, inteiro, sem pele, assado"),
    ("Peito pequeno de frango assado", "Frango, inteiro, sem pele, assado"),
    ("Ovos mexidos (com tomate e cebola)", "Ovo, de galinha, inteiro, cozido/10minutos"),
    ("Mix: chuchu e cenoura cozidos", "Chuchu, cozido"),
    ("Filé de peito de frango grelhado", "Frango, peito, sem pele, grelhado"),   # certo, só muda a ordem das palavras
}


def test_integracao_dietas_ligacoes_fazem_sentido(resultado):
    """O antigo data.sql ligava por 'contém o texto' e errava (ex.: 'Pera' -> 'farofa temperada')."""
    d = resultado["dietas"]
    erradas = []
    for descricao, alimento in sorted(set(zip(d["descricao"], d["alimento_taco"]))):
        if alimento == "" or (descricao, alimento) in APROXIMACOES_ACEITAS:
            continue
        # a 1ª palavra da descrição ("Pera") precisa ser uma das 2 primeiras palavras do alimento
        # ("Pêra, Williams, crua"); assim "temperada" não conta como "pera"
        primeira = re.findall(r"[a-z0-9]+", t.sem_acento(descricao))[0].rstrip("s")
        inicio_alimento = [p.rstrip("s") for p in re.findall(r"[a-z0-9]+", t.sem_acento(alimento))[:2]]
        if primeira not in inicio_alimento:
            erradas.append((descricao, alimento))
    assert erradas == []


def test_integracao_dietas_modelo(resultado):
    d = resultado["dietas"]
    assert d["dieta"].nunique() == 8
    assert d.groupby(["dieta", "horario", "refeicao"]).ngroups == 39
    assert len(d) == 175
    nomes_taco = set(resultado["alimentos"].query("fonte == 'TACO'")["nome"])
    ligados = d[d["alimento_taco"] != ""]["alimento_taco"]
    assert set(ligados) <= nomes_taco                    # todo alimento citado existe na TACO
    assert (d["alimento_taco"] == "").sum() == 42        # os mesmos itens que já ficavam sem alimento
    comandos = t.montar_comandos_dietas(d)
    for sql, parametros in comandos:
        assert sql.count("%s") == len(parametros)
