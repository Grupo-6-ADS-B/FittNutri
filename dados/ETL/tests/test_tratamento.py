"""
Testes do ETL (tratamento.py).

Como rodar (a partir da pasta dados/ETL):
    pip install -r requirements-dev.txt
    python -m pytest tests -q

Os testes da primeira parte usam dados inventados (rápidos). Os da última parte ("integração")
leem os arquivos reais (TACO, IBGE, medidas) e levam alguns segundos.
"""
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
        linha(fonte="TACO", nome="Arroz", energia_kcal=100, medidas_fonte=t.FONTE_IBGE, gramas_colher_sopa=20),
        linha(fonte="IBGE", nome="Arroz", energia_kcal=100, medidas_fonte=None),     # mesmo nome da TACO
        linha(fonte="IBGE", nome="Feijao", energia_kcal=80, medidas_fonte=None),
    )
    df = t.adicionar_valores_por_grama(df)
    colunas_novas, comandos = t.montar_comandos_sql(df)
    assert "medidas_fonte" in colunas_novas
    for sql, parametros in comandos:
        assert sql.count("%s") == len(parametros)                 # nenhum valor vai colado no texto do SQL
    inserts = [p for sql, p in comandos if sql.startswith("INSERT")]
    assert [p[1] for p in inserts] == ["Arroz (IBGE)", "Feijao"]   # nome repetido ganha o sufixo
    assert sum(1 for sql, _ in comandos if "fonte = 'TACO'" in sql) == 1


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
    assert len(comandos) == 597 + 1971 + 1971   # UPDATE TACO + INSERT IBGE + UPDATE IBGE
