"""
ETL da tabela de alimentos do FittNutri.

Lê as tabelas TACO (TACO.xlsx) e IBGE/POF 2008-2009 (IBGE.xls), limpa os
valores, padroniza as colunas com os nomes da tabela "alimentos" do banco,
junta as duas fontes, acrescenta os gramas das medidas caseiras usadas no
front (Tabela de Medidas Referidas do IBGE, tabelamedidas_bd.xls) e calcula
os nutrientes por 1 g.

Medidas caseiras (gramas de 1 colher, 1 xícara, 1 unidade...) - de onde vem cada valor
(a origem fica registrada na coluna "medidas_fonte" da tabela "alimentos"):
    IBGE           medida real do próprio alimento na tabela do IBGE
    IBGE_REF_TACO  medida real do IBGE herdada pela TACO (o IBGE copiou a composição da TACO)
    MAPEADO        medida real do IBGE ligada a um alimento da TACO pelo arquivo mapa_taco_ibge.csv
                   (mesmo alimento e mesmo preparo, conferido pela equipe)
    REFERENCIA_EXTERNA  valor APROXIMADO tirado de uma tabela brasileira de medidas caseiras (UFG),
                   listado no arquivo medidas_complementares.csv com a referência de cada linha
    ESTIMADO       valor APROXIMADO calculado pelo ETL (volume de líquidos ou mediana do grupo de
                   alimentos). Não é medida real: serve só para dar uma ordem de grandeza.
Quando uma linha mistura origens, "medidas_fonte" guarda a MENOS confiável (ESTIMADO é a pior).
O detalhe de cada medida fica no relatório relatorio_medidas.csv.

Mesma lógica do notebook tratamento.ipynb (atenção: o notebook ainda NÃO tem as medidas
mapeadas/estimadas nem a coluna medidas_fonte; este arquivo é a versão mais atual).

Uso (a partir da pasta dados/ETL):
    python tratamento.py           -> trata os dados, salva o CSV, o relatório e o script SQL
    python tratamento.py --mysql   -> faz o mesmo e aplica o script no MySQL local

Conexão com o MySQL (variáveis de ambiente, com os mesmos padrões do backend):
    DB_HOST (localhost), DB_PORT (3306), DB_NAME (fittnutri), DB_USER (root)
    DB_PASSWORD -> se não existir, a senha é pedida no terminal
"""
import argparse
import getpass
import os
import re
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd

PASTA = Path(__file__).parent
CAMINHO_TACO = PASTA / "TACO.xlsx"
CAMINHO_IBGE = PASTA / "IBGE.xls"
# Tabela de Medidas Referidas para os Alimentos Consumidos no Brasil (POF 2008-2009)
# https://ftp.ibge.gov.br/Orcamentos_Familiares/Pesquisa_de_Orcamentos_Familiares_2008_2009/Tabela_de_Medidas_Referidas_para_os_Alimentos_Consumidos_no_Brasil/
CAMINHO_MEDIDAS = PASTA / "tabelamedidas_bd.xls"
# Ligação manual TACO -> IBGE (mesmo alimento e mesmo preparo) para herdar medidas reais
CAMINHO_MAPA = PASTA / "mapa_taco_ibge.csv"
# Valores aproximados de tabela externa para o que o IBGE não tem (com a referência de cada linha)
CAMINHO_COMPLEMENTAR = PASTA / "medidas_complementares.csv"
CAMINHO_SAIDA = PASTA / "alimentos_tratados.csv"
CAMINHO_RELATORIO = PASTA / "relatorio_medidas.csv"
CAMINHO_SQL = PASTA.parent / "Query" / "Script medidas caseiras e alimentos IBGE.sql"

CABECALHO_TACO = [
    "numero_alimento",
    "descricao_alimentos",
    "umidade (%)",
    "energia (kcal)",
    "energia (kJ)",
    "proteina (g)",
    "lipideos (g)",
    "colesterol (mg)",
    "carboidrato (g)",
    "fibra_alimentar (g)",
    "cinzas (g)",
    "calcio (mg)",
    "magnesio (mg)",
    "numero_alimento_2",
    "manganes (mg)",
    "fosforo (mg)",
    "ferro (mg)",
    "sodio (mg)",
    "potassio (mg)",
    "cobre (mg)",
    "zinco (mg)",
    "retinol (mcg)",
    "re (mcg)",
    "rae (mcg)",
    "tiamina (mg)",
    "riboflavina (mg)",
    "piridoxina (mg)",
    "niacina (mg)",
    "vitamina_c (mg)",
]

# Mesmos nomes da tabela "alimentos" do backend (FoodItensModel / data.sql)
COLUNAS_ALIMENTOS = [
    "nome", "umidade", "energia_kcal", "proteina", "lipideos", "colesterol",
    "carboidrato", "fibra", "cinzas", "calcio", "magnesio", "manganes",
    "fosforo", "ferro", "sodio", "potassio", "cobre", "zinco", "retinol",
    "tiamina", "riboflavina", "piridoxina", "niacina", "vitaminac",
]

# A umidade é um percentual (%), não depende da quantidade -> sem coluna por 1 g
COLUNAS_NUTRIENTES = [c for c in COLUNAS_ALIMENTOS if c not in ("nome", "umidade")]

MAPA_TACO = {
    "descricao_alimentos": "nome",
    "umidade (%)": "umidade",
    "energia (kcal)": "energia_kcal",
    "proteina (g)": "proteina",
    "lipideos (g)": "lipideos",
    "colesterol (mg)": "colesterol",
    "carboidrato (g)": "carboidrato",
    "fibra_alimentar (g)": "fibra",
    "cinzas (g)": "cinzas",
    "calcio (mg)": "calcio",
    "magnesio (mg)": "magnesio",
    "manganes (mg)": "manganes",
    "fosforo (mg)": "fosforo",
    "ferro (mg)": "ferro",
    "sodio (mg)": "sodio",
    "potassio (mg)": "potassio",
    "cobre (mg)": "cobre",
    "zinco (mg)": "zinco",
    "retinol (mcg)": "retinol",
    "tiamina (mg)": "tiamina",
    "riboflavina (mg)": "riboflavina",
    "piridoxina (mg)": "piridoxina",
    "niacina (mg)": "niacina",
    "vitamina_c (mg)": "vitaminac",
}

# O IBGE não tem umidade nem cinzas -> ficam nulas
MAPA_IBGE = {
    "ENERGIA (kcal)": "energia_kcal",
    "PROTEÍNA (g)": "proteina",
    "LIPÍDEOS TOTAIS (g)": "lipideos",
    "COLESTEROL (mg)": "colesterol",
    "CARBOIDRATO (g)": "carboidrato",
    "FIBRA ALIMENTAR TOTAL (g)": "fibra",
    "CÁLCIO (mg)": "calcio",
    "MAGNÉSIO (mg)": "magnesio",
    "MANGANÊS (mg)": "manganes",
    "FÓSFORO (mg)": "fosforo",
    "FERRO (mg)": "ferro",
    "SÓDIO (mg)": "sodio",
    "POTÁSSIO (mg)": "potassio",
    "COBRE (mg)": "cobre",
    "ZINCO (mg)": "zinco",
    "RETINOL (mcg)": "retinol",
    "TIAMINA (VITAMINA B1) (mg)": "tiamina",
    "RIBOFLAVINA (VITAMINA B2) (mg)": "riboflavina",
    "PIRIDOXINA (VITAMINA B6) (mg)": "piridoxina",
    "NIACINA (VITAMINA B3) (mg)": "niacina",
    "VITAMINA C (mg)": "vitaminac",
}

# Medidas do front (frontend/src/components/MealModal.jsx) -> código do tipo de
# medida na tabela do IBGE. g e kg são conversões fixas (1 g e 1000 g) e L = 1000 ml.
MEDIDAS_IBGE = {
    103: "gramas_unidade",      # UNIDADE
    16: "gramas_colher_sopa",   # COLHER DE SOPA
    14: "gramas_colher_cha",    # COLHER DE CHA
    106: "gramas_xicara",       # XICARA DE CHA
    79: "gramas_ml",            # MILILITRO
}
COLUNAS_MEDIDAS = list(MEDIDAS_IBGE.values())

# Origem de cada medida (ver docstring). Do mais ao menos confiável.
FONTE_IBGE = "IBGE"
FONTE_REF_TACO = "IBGE_REF_TACO"
FONTE_MAPEADO = "MAPEADO"
FONTE_EXTERNA = "REFERENCIA_EXTERNA"
FONTE_ESTIMADO = "ESTIMADO"
ORDEM_CONFIANCA = [FONTE_IBGE, FONTE_REF_TACO, FONTE_MAPEADO, FONTE_EXTERNA, FONTE_ESTIMADO]
COLUNAS_ORIGEM = [f"origem_{c}" for c in COLUNAS_MEDIDAS]

# Maior valor (em gramas) aceito para 1 medida. Acima disso o dado é tratado como erro de
# digitação (ex.: 110 g numa colher de chá) e descartado, porque multiplicaria os macros por
# um fator absurdo. Valores muito baixos (ex.: orégano) são aceitos: o erro seria desprezível.
LIMITE_MAXIMO_MEDIDA = {
    "gramas_unidade": 1500,
    "gramas_colher_sopa": 80,
    "gramas_colher_cha": 30,
    "gramas_xicara": 500,
    "gramas_ml": 1.5,
}

# --- Estimativas aproximadas (origem ESTIMADO) ---------------------------------------------
# Os grupos de alimentos do IBGE vêm dos 2 primeiros dígitos do código do alimento
# (63 cereais, 79 laticínios, 82 refrigerantes...). A TACO tem o próprio grupo. Os dois são
# levados para um grupo comum, para estimar com a mediana das medidas reais do IBGE.
GRUPOS_IBGE = {
    "63": "cereais", "65": "cereais", "80": "cereais",
    "64": "hortalicas", "67": "hortalicas",
    "68": "frutas",
    "84": "oleos",
    "72": "pescados", "74": "pescados", "76": "pescados",
    "71": "carnes", "78": "carnes", "81": "carnes",
    "79": "leites",
    "82": "bebidas", "83": "bebidas",
    "69": "acucares",
    "70": "temperos",
    "77": "conservas",
    "85": "preparados",
}
GRUPOS_TACO = {
    "cereais e derivados": "cereais",
    "leguminosas e derivados": "cereais",  # no IBGE o feijão está junto dos cereais (código 63)
    "verduras, hortalicas e derivados": "hortalicas",
    "frutas e derivados": "frutas",
    "gorduras e oleos": "oleos",
    "pescados e frutos do mar": "pescados",
    "carnes e derivados": "carnes",
    "leite e derivados": "leites",
    "bebidas (alcoolicas e nao alcoolicas)": "bebidas",
    "produtos acucarados": "acucares",
    "miscelaneas": "temperos",
    "alimentos preparados": "preparados",
    "outros alimentos industrializados": "preparados",
}
# "Unidade" não entra: varia de 0,3 g a 750 g, qualquer valor genérico seria chute.
MEDIDAS_ESTIMAVEIS_POR_GRUPO = ["gramas_colher_sopa", "gramas_colher_cha", "gramas_xicara"]
# Só estima com a mediana do grupo se houver pelo menos essa quantidade de medidas reais...
MINIMO_OBSERVACOES = 5
# ...e se o grupo for homogêneo: a faixa do meio dos valores (3º - 1º quartil) não pode passar de
# 60% da mediana. Ex.: "açúcares" mistura açúcar, mel e chocolate (faixa de 91%) -> sem estimativa.
DISPERSAO_MAXIMA = 0.6
# Grupos que misturam líquido, pó e sólido: só valem as regras de líquido, nunca a mediana do grupo.
GRUPOS_SEM_ESTIMATIVA_POR_MEDIANA = {"leites", "bebidas", "oleos", "preparados"}

# Líquidos: gramas = volume (ml) x densidade. Volumes padrão de utensílios (aproximados).
VOLUME_ML = {
    "gramas_ml": 1,
    "gramas_colher_sopa": 15,
    "gramas_colher_cha": 5,
    "gramas_xicara": 200,   # xícara de chá (a mediana do IBGE para líquidos também é 200 g)
}
DENSIDADE_AGUA = 1.0        # água, café, chá, suco, leite e iogurte: ~1 g/ml
DENSIDADE_OLEO = 0.92       # óleos e azeites: ~0,92 g/ml
DENSIDADE_DESTILADO = 0.94  # cachaça, rum, vodka, uísque (~40% de álcool): ~0,94 g/ml
# Primeira palavra do nome de bebidas destiladas (têm muitas calorias, mas são líquidos)
DESTILADOS = {"cachaca", "aguardente", "rum", "vodka", "uisque", "whisky", "conhaque"}
# Nomes que indicam bebida/caldo pronto (vale a regra das poucas calorias abaixo)
PALAVRAS_LIQUIDO = ("refresco", "suco", "vitamina", "milk shake", "caldo")
# Para tratar como "líquido de densidade ~1" o alimento precisa ter poucas calorias; assim o
# leite em pó, o leite condensado, o creme de leite e a aguardente ficam de fora.
KCAL_MAXIMO_LIQUIDO = 120   # kcal por 100 g

# Legenda da TACO / IBGE:
#   Tr  = traço (valor muito pequeno, arredondado)  -> nulo
#   *   = análise sendo reavaliada                  -> nulo
#   NA  = não se aplica                             -> nulo
#   -   = sem informação (IBGE)                     -> nulo
#   " " = análise não solicitada                    -> nulo
VALORES_NULOS = {"", "Tr", "*", "NA", "-"}

# Limites de sanidade dos nutrientes (por 100 g), só para gerar alertas
KCAL_MAXIMA_100G = 950           # gordura pura tem ~900 kcal/100 g
MACROS_MAXIMO_100G = 105         # proteína + lipídeo + carboidrato não passa de 100 g (com folga)
TOLERANCIA_NEGATIVO = 0.1        # negativo até esse valor (por 100 g) é resíduo de arredondamento -> 0


def sem_acento(texto):
    """Minúsculo e sem acento, para comparar nomes ("Hortaliças" -> "hortalicas")."""
    texto = unicodedata.normalize("NFKD", str(texto))
    return texto.encode("ascii", "ignore").decode().lower().strip()


def parece_po(nome):
    """True se o nome indica alimento em pó ("Leite, de vaca, integral, pó"; "Leite em po desnatado")."""
    return "po" in re.split(r"[^a-z0-9]+", sem_acento(nome))


def limpar_valor(valor):
    """Converte os códigos da legenda em nulo e a vírgula decimal em ponto (",0,02" -> 0.02)."""
    if isinstance(valor, str):
        texto = valor.strip()
        if texto in VALORES_NULOS:
            return np.nan
        return pd.to_numeric(texto.lstrip(",").replace(",", "."), errors="coerce")
    return valor


def extrair_taco(caminho):
    """Lê a TACO, descarta os cabeçalhos repetidos de cada página e marca o grupo de cada alimento."""
    # header=None: o cabeçalho tem 2 linhas e se repete a cada página da planilha
    df_bruto = pd.read_excel(caminho, sheet_name=0, header=None)

    linhas_alimentos = []
    grupos = []
    grupo_atual = None

    for _, linha in df_bruto.iterrows():
        primeira = linha[0]

        # linha com número na 1ª coluna -> alimento
        if pd.notna(pd.to_numeric(primeira, errors="coerce")):
            linhas_alimentos.append(linha)
            grupos.append(grupo_atual)
            continue

        if not isinstance(primeira, str):
            continue

        texto = primeira.strip()
        if texto == "Legenda":  # fim dos dados
            break
        if texto.startswith("Número") or texto == "Alimento":  # cabeçalho repetido
            continue
        if pd.isna(linha[1]):  # só texto na 1ª coluna -> novo grupo
            grupo_atual = texto

    df = pd.DataFrame(linhas_alimentos).reset_index(drop=True)
    df.columns = CABECALHO_TACO
    df.insert(0, "grupo", grupos)
    return df


def transformar_taco(df):
    """Limpa os valores da TACO e padroniza as colunas."""
    df = df.copy()
    colunas_numericas = CABECALHO_TACO[2:]
    df[colunas_numericas] = df[colunas_numericas].map(limpar_valor).astype(float)
    df["numero_alimento"] = df["numero_alimento"].astype(int)
    df["descricao_alimentos"] = df["descricao_alimentos"].str.strip()

    # numero_alimento_2 é só a repetição do número (meio da página na planilha)
    assert (df["numero_alimento"] == df["numero_alimento_2"]).all()

    df = df.rename(columns=MAPA_TACO)
    df["fonte"] = "TACO"
    df["codigo_origem"] = df["numero_alimento"]
    return df[["fonte", "codigo_origem", "grupo"] + COLUNAS_ALIMENTOS]


def montar_nome_ibge(linha):
    """Mesmo padrão já usado no SQL: "Frango inteiro - Cozido(a)"."""
    descricao = str(linha["DESCRIÇÃO DO ALIMENTO"]).strip().capitalize()
    preparacao = str(linha["DESCRIÇÃO DA PREPARAÇÃO"]).strip()
    if preparacao.upper() == "NAO SE APLICA":
        return descricao
    return f"{descricao} - {preparacao.capitalize()}"


def extrair_ibge(caminho):
    """Lê a tabela do IBGE e remove o rodapé."""
    # header=3: as 3 primeiras linhas são o título da pesquisa (POF 2008-2009)
    df = pd.read_excel(caminho, sheet_name=0, header=3)
    # Junta espaços repetidos: "CÓDIGO      DA PREPARAÇÃO" -> "CÓDIGO DA PREPARAÇÃO"
    df.columns = [" ".join(str(c).split()) for c in df.columns]
    # Remove o rodapé "Fonte: IBGE..." (linhas sem código numérico)
    df = df[pd.to_numeric(df["CÓDIGO DO ALIMENTO"], errors="coerce").notna()].copy()
    df["CÓDIGO DO ALIMENTO"] = df["CÓDIGO DO ALIMENTO"].astype(int)
    df["CÓDIGO DA PREPARAÇÃO"] = df["CÓDIGO DA PREPARAÇÃO"].astype(int)
    return df


def transformar_ibge(df):
    """Monta o nome, limpa os valores do IBGE e padroniza as colunas."""
    faltando = set(MAPA_IBGE) - set(df.columns)
    assert not faltando, f"Colunas não encontradas no IBGE: {faltando}"

    df = df.copy()
    df["nome"] = df.apply(montar_nome_ibge, axis=1)
    df = df.rename(columns=MAPA_IBGE)

    colunas_numericas = list(MAPA_IBGE.values())
    df[colunas_numericas] = df[colunas_numericas].map(limpar_valor).astype(float)

    df["umidade"] = np.nan
    df["cinzas"] = np.nan
    df["fonte"] = "IBGE"
    df["codigo_origem"] = df["CÓDIGO DO ALIMENTO"]
    df["codigo_preparacao"] = df["CÓDIGO DA PREPARAÇÃO"]
    df["grupo"] = None
    return df[["fonte", "codigo_origem", "codigo_preparacao", "grupo"] + COLUNAS_ALIMENTOS]


def extrair_medidas(caminho):
    """
    Lê a Tabela de Medidas Referidas do IBGE e monta uma linha por alimento +
    preparação, com uma coluna de gramas para cada medida do front.
    """
    df = pd.read_excel(caminho, sheet_name=0, header=3)
    df.columns = [" ".join(str(c).split()) for c in df.columns]
    df = df[pd.to_numeric(df["CÓDIGO DO ALIMENTO"], errors="coerce").notna()]
    df = df[df["CÓDIGO DO TIPO DE MEDIDA"].isin(MEDIDAS_IBGE)]

    df = df.assign(
        codigo_origem=df["CÓDIGO DO ALIMENTO"].astype(int),
        codigo_preparacao=df["CÓDIGO DA PREPARAÇÃO"].astype(int),
        medida=df["CÓDIGO DO TIPO DE MEDIDA"].map(MEDIDAS_IBGE),
    )
    # Cada alimento + preparação + medida aparece uma vez só na tabela do IBGE
    medidas = df.pivot(
        index=["codigo_origem", "codigo_preparacao"],
        columns="medida",
        values="QUANTIDADE EM GRAMAS",
    )
    return medidas.reindex(columns=COLUNAS_MEDIDAS).astype(float).reset_index()


def registrar_origem(df, origem):
    """Cria as colunas origem_<medida>: onde já há valor grava a origem, senão deixa vazio."""
    df = df.copy()
    for medida in COLUNAS_MEDIDAS:
        df[f"origem_{medida}"] = np.where(df[medida].notna(), origem, None)
    return df


def adicionar_medidas_ibge(df_ibge, df_medidas):
    """Liga as medidas aos alimentos do IBGE pelo código do alimento + código da preparação."""
    df = df_ibge.merge(df_medidas, on=["codigo_origem", "codigo_preparacao"], how="left")
    return registrar_origem(df, FONTE_IBGE)


def adicionar_medidas_taco(df_taco, df_ibge_bruto, df_medidas):
    """
    A tabela de medidas só usa códigos do IBGE. Mas o IBGE.xls informa quando a
    composição de um alimento foi copiada da TACO (referência 2) e traz o nome
    exato do alimento na TACO. Por esse caminho levamos as medidas para a TACO.
    Se vários alimentos do IBGE apontam para o mesmo da TACO (ex: mandioca,
    aipim e macaxeira -> "Mandioca, cozida"), usamos a mediana dos gramas.
    """
    ligacao = df_ibge_bruto.loc[df_ibge_bruto["REFE RÊNCIA"] == 2].assign(
        codigo_origem=df_ibge_bruto["CÓDIGO DO ALIMENTO"],
        codigo_preparacao=df_ibge_bruto["CÓDIGO DA PREPARAÇÃO"],
        nome=df_ibge_bruto["DESCRIÇÃO NA REFERÊNCIA"].str.strip(),
    )[["codigo_origem", "codigo_preparacao", "nome"]]

    medidas_taco = (
        ligacao.merge(df_medidas, on=["codigo_origem", "codigo_preparacao"])
        .groupby("nome")[COLUNAS_MEDIDAS]
        .median()
        .reset_index()
    )
    df = df_taco.merge(medidas_taco, on="nome", how="left")
    return registrar_origem(df, FONTE_REF_TACO)


def carregar_mapa(caminho):
    """Lê o mapa TACO -> IBGE feito à mão (mesmo alimento e mesmo preparo)."""
    mapa = pd.read_csv(caminho, encoding="utf-8")
    colunas = {"taco_nome", "ibge_codigo_alimento", "ibge_codigo_preparacao"}
    faltando = colunas - set(mapa.columns)
    assert not faltando, f"Colunas não encontradas em {caminho.name}: {faltando}"
    assert not mapa["taco_nome"].duplicated().any(), "Alimento repetido no mapa TACO -> IBGE"
    return mapa


def adicionar_medidas_mapeadas(df_taco, df_medidas, mapa):
    """
    Completa a TACO com medidas reais do IBGE indicadas no mapa. Só preenche o que ainda está
    vazio (a herança direta da TACO tem prioridade). Falha se o mapa citar um alimento que
    não existe, para um erro de digitação não passar em silêncio.
    """
    df = df_taco.copy()
    ligacao = mapa.merge(
        df_medidas,
        left_on=["ibge_codigo_alimento", "ibge_codigo_preparacao"],
        right_on=["codigo_origem", "codigo_preparacao"],
        how="left",
    )
    for _, linha in ligacao.iterrows():
        posicoes = df.index[df["nome"] == linha["taco_nome"]]
        assert len(posicoes) == 1, f"Mapa cita alimento que não está na TACO: {linha['taco_nome']}"
        assert linha[COLUNAS_MEDIDAS].notna().any(), (
            f"Mapa aponta para um item do IBGE sem medidas: {linha['taco_nome']}"
        )
        posicao = posicoes[0]
        for medida in COLUNAS_MEDIDAS:
            if pd.isna(df.at[posicao, medida]) and pd.notna(linha[medida]):
                df.at[posicao, medida] = linha[medida]
                df.at[posicao, f"origem_{medida}"] = FONTE_MAPEADO
    return df


def carregar_complementares(caminho):
    """Lê os valores aproximados de tabela externa (cada linha traz a referência de onde veio)."""
    comp = pd.read_csv(caminho, encoding="utf-8")
    colunas = {"fonte", "nome", "referencia", *COLUNAS_MEDIDAS}
    faltando = colunas - set(comp.columns)
    assert not faltando, f"Colunas não encontradas em {caminho.name}: {faltando}"
    assert not comp.duplicated(["fonte", "nome"]).any(), "Alimento repetido em medidas_complementares.csv"
    assert comp["referencia"].notna().all(), "Toda linha de medidas_complementares.csv precisa de referência"
    return comp


def adicionar_medidas_complementares(df, comp):
    """
    Completa com os valores aproximados da tabela externa. Só preenche o que ainda está vazio
    (o dado real do IBGE sempre tem prioridade). Falha se citar um alimento que não existe.
    """
    df = df.copy()
    for _, linha in comp.iterrows():
        posicoes = df.index[(df["fonte"] == linha["fonte"]) & (df["nome"] == linha["nome"])]
        assert len(posicoes) == 1, f"Complemento cita alimento que não existe: [{linha['fonte']}] {linha['nome']}"
        posicao = posicoes[0]
        for medida in COLUNAS_MEDIDAS:
            if pd.isna(df.at[posicao, medida]) and pd.notna(linha[medida]):
                df.at[posicao, medida] = linha[medida]
                df.at[posicao, f"origem_{medida}"] = FONTE_EXTERNA
    return df


def descartar_medidas_implausiveis(df):
    """Zera medidas zeradas/negativas ou acima do limite e devolve também a lista do que foi descartado."""
    df = df.copy()
    descartadas = []
    for medida, maximo in LIMITE_MAXIMO_MEDIDA.items():
        invalidas = df[medida].notna() & ((df[medida] <= 0) | (df[medida] > maximo))
        for _, linha in df.loc[invalidas].iterrows():
            descartadas.append((linha["fonte"], linha["nome"], medida, linha[medida]))
        df.loc[invalidas, medida] = np.nan
        df.loc[invalidas, f"origem_{medida}"] = None
    return df, descartadas


def grupo_estimativa(linha):
    """Grupo comum (IBGE e TACO) usado para estimar. Vazio se o grupo não tem equivalente."""
    if linha["fonte"] == "IBGE":
        return GRUPOS_IBGE.get(str(int(linha["codigo_origem"]))[:2])
    return GRUPOS_TACO.get(sem_acento(linha["grupo"]))


def calcular_medianas(df_ibge_real):
    """
    Mediana de cada medida por grupo, usando só medidas REAIS do IBGE. Grupos com poucos dados,
    muito heterogêneos ou que misturam líquido/pó/sólido não geram estimativa.
    Devolve {(grupo, medida): (mediana, quantidade, dispersão)}.
    """
    df = df_ibge_real.assign(grupo_est=df_ibge_real.apply(grupo_estimativa, axis=1))
    medianas = {}
    for grupo, parte in df.groupby("grupo_est"):
        if grupo in GRUPOS_SEM_ESTIMATIVA_POR_MEDIANA:
            continue
        for medida in MEDIDAS_ESTIMAVEIS_POR_GRUPO:
            valores = parte[medida].dropna()
            if len(valores) < MINIMO_OBSERVACOES:
                continue
            mediana = float(valores.median())
            q1, q3 = valores.quantile([0.25, 0.75])
            dispersao = float((q3 - q1) / mediana)
            if dispersao <= DISPERSAO_MAXIMA:
                medianas[(grupo, medida)] = (mediana, len(valores), dispersao)
    return medianas


def densidade_liquido(linha):
    """
    Densidade (g/ml) se o alimento é um líquido comum; None caso contrário.
    Óleos e azeites: 0,92. Destilados: 0,94. Bebidas, sucos, leite, iogurte e caldos com poucas
    calorias: ~1,0.
    """
    nome = sem_acento(linha["nome"])
    if nome.startswith(("oleo", "azeite")):
        return DENSIDADE_OLEO
    palavras = re.findall(r"[a-z0-9]+", nome)
    if palavras and (palavras[0] in DESTILADOS or "aguardente" in palavras):
        return DENSIDADE_DESTILADO

    kcal = linha["energia_kcal"]  # por 100 g (ainda não dividido por 100 nesta etapa)
    if pd.notna(kcal):
        if kcal > KCAL_MAXIMO_LIQUIDO:
            return None
    elif parece_po(nome):  # sem kcal na tabela (ex.: leite integral da TACO): só descarta o que é pó
        return None

    lacteo = nome.startswith(("leite", "iogurte", "bebida lactea"))
    pelo_nome = any(p in nome for p in PALAVRAS_LIQUIDO) and "concentrado" not in nome
    if linha["fonte"] == "IBGE":
        prefixo = str(int(linha["codigo_origem"]))[:2]
        candidato = prefixo in ("82", "83") or (prefixo == "79" and lacteo) or pelo_nome
    else:
        grupo = sem_acento(linha["grupo"])
        candidato = grupo.startswith("bebidas") or (grupo.startswith("leite") and lacteo) or pelo_nome
    return DENSIDADE_AGUA if candidato else None


def estimar_medidas(df, medianas):
    """
    Preenche com valores APROXIMADOS (origem ESTIMADO) o que ainda está vazio:
      1) líquidos: gramas = volume padrão do utensílio x densidade;
      2) colher de sopa, colher de chá e xícara: mediana do grupo de alimentos.
    "Unidade" nunca é estimada.
    """
    df = df.copy()
    for posicao, linha in df.iterrows():
        densidade = densidade_liquido(linha)
        grupo = grupo_estimativa(linha)
        for medida in COLUNAS_MEDIDAS:
            if pd.notna(linha[medida]):
                continue
            valor = None
            if densidade is not None and medida in VOLUME_ML:
                valor = VOLUME_ML[medida] * densidade
            elif (
                medida in MEDIDAS_ESTIMAVEIS_POR_GRUPO
                and (grupo, medida) in medianas
                and not parece_po(linha["nome"])
            ):
                valor = medianas[(grupo, medida)][0]
            if valor is not None:
                df.at[posicao, medida] = valor
                df.at[posicao, f"origem_{medida}"] = FONTE_ESTIMADO
    return df


def fonte_geral(linha):
    """Origem da linha = a MENOS confiável entre as medidas preenchidas (None se não tem medida)."""
    origens = [linha[c] for c in COLUNAS_ORIGEM if pd.notna(linha[c])]
    if not origens:
        return None
    return max(origens, key=ORDEM_CONFIANCA.index)


def corrigir_negativos_pequenos(df):
    """
    A TACO calcula alguns carboidratos "por diferença" e deixa passar resíduos de arredondamento
    como -0,03 g/100 g. Valores negativos até TOLERANCIA_NEGATIVO viram 0; os maiores continuam
    negativos e são barrados pela validação. Devolve também a lista do que foi corrigido.
    """
    df = df.copy()
    corrigidos = []
    for coluna in COLUNAS_ALIMENTOS[1:]:
        pequenos = (df[coluna] < 0) & (df[coluna] >= -TOLERANCIA_NEGATIVO)
        for _, linha in df.loc[pequenos].iterrows():
            corrigidos.append((linha["fonte"], linha["nome"], coluna, linha[coluna]))
        df.loc[pequenos, coluna] = 0.0
    return df, corrigidos


def validar_dados(df):
    """
    Confere a qualidade dos dados (valores por 100 g, antes de dividir por 100).
    Devolve (erros, alertas): erros impedem a carga; alertas só são mostrados.
    """
    erros, alertas = [], []

    for fonte, parte in df.groupby("fonte"):
        repetidos = parte.loc[parte["nome"].duplicated(keep=False), "nome"].unique()
        if len(repetidos):
            erros.append(f"{fonte}: nomes repetidos ({len(repetidos)}), ex.: {list(repetidos[:3])}")

    negativos = (df[COLUNAS_ALIMENTOS[1:]] < 0).any(axis=1)
    if negativos.any():
        erros.append(f"{int(negativos.sum())} alimento(s) com nutriente negativo, ex.: {list(df.loc[negativos, 'nome'][:3])}")

    muito_calorico = df["energia_kcal"] > KCAL_MAXIMA_100G
    if muito_calorico.any():
        alertas.append(f"{int(muito_calorico.sum())} alimento(s) com mais de {KCAL_MAXIMA_100G} kcal/100 g: {list(df.loc[muito_calorico, 'nome'][:5])}")

    macros = df[["proteina", "lipideos", "carboidrato"]].sum(axis=1, min_count=1)
    macros_altos = macros > MACROS_MAXIMO_100G
    if macros_altos.any():
        alertas.append(f"{int(macros_altos.sum())} alimento(s) com macros somando mais de {MACROS_MAXIMO_100G} g/100 g: {list(df.loc[macros_altos, 'nome'][:5])}")

    sem_kcal = df["energia_kcal"].isna()
    if sem_kcal.any():
        alertas.append(f"{int(sem_kcal.sum())} alimento(s) sem energia (kcal): {list(df.loc[sem_kcal, 'nome'][:5])}")

    return erros, alertas


def adicionar_valores_por_grama(df):
    """
    As tabelas trazem os nutrientes para 100 g. Dividindo por 100 temos o
    valor de 1 g, base para qualquer medida caseira:
        valor da porção = valor por 1 g x gramas da porção
    """
    df = df.copy()
    for coluna in COLUNAS_NUTRIENTES:
        df[f"{coluna}_1g"] = df[coluna] / 100
    return df


def calcular_porcao(df_alimentos, nome, gramas, fonte="TACO"):
    """Nutrientes de uma porção em gramas (ex: 3 colheres de sopa = 60 g)."""
    alimento = df_alimentos[(df_alimentos["nome"] == nome) & (df_alimentos["fonte"] == fonte)].iloc[0]
    return pd.Series(
        {coluna: alimento[f"{coluna}_1g"] * gramas for coluna in COLUNAS_NUTRIENTES},
        name=f"{nome} ({gramas} g)",
    ).round(2)


def calcular_medida(df_alimentos, nome, medida, quantidade, fonte="IBGE"):
    """Nutrientes de uma medida caseira (ex: 2 x "colher_sopa") usando os gramas da tabela do IBGE."""
    alimento = df_alimentos[(df_alimentos["nome"] == nome) & (df_alimentos["fonte"] == fonte)].iloc[0]
    gramas = alimento[f"gramas_{medida}"]
    if pd.isna(gramas):
        raise ValueError(f"{nome} não tem a medida {medida}")
    porcao = calcular_porcao(df_alimentos, nome, quantidade * gramas, fonte)
    porcao.name = f"{nome} ({quantidade} {medida} = {quantidade * gramas:g} g)"
    return porcao


def valor_sql(valor):
    """Converte um valor em literal SQL (nulo -> NULL, texto entre aspas, com \\ e ' escapados)."""
    if valor is None or (isinstance(valor, float) and np.isnan(valor)):
        return "NULL"
    if isinstance(valor, str):
        return "'" + valor.replace("\\", "\\\\").replace("'", "''") + "'"
    return repr(round(float(valor), 6))


def valor_parametro(valor):
    """Valor pronto para ir como parâmetro da consulta (nulo -> None, número com 6 casas)."""
    if valor is None or (isinstance(valor, float) and np.isnan(valor)):
        return None
    if isinstance(valor, str):
        return valor
    return round(float(valor), 6)


def renderizar_sql(sql, parametros):
    """Troca cada %s do comando pelo literal SQL do parâmetro (só para gravar o script .sql)."""
    pedacos = sql.split("%s")
    assert len(pedacos) == len(parametros) + 1, "Quantidade de parâmetros diferente da de %s"
    texto = pedacos[0]
    for parametro, pedaco in zip(parametros, pedacos[1:]):
        texto += valor_sql(parametro) + pedaco
    return texto


def montar_comandos_sql(df_alimentos):
    """
    Monta os comandos para o MySQL. Atenção ao padrão do banco: o data.sql do
    backend insere a TACO por 100 g e depois DIVIDE tudo por 100, ou seja, a
    tabela "alimentos" guarda os nutrientes POR 1 g. Por isso o IBGE entra com
    as colunas *_1g. As medidas caseiras ficam em gramas (não são divididas).

    Retorna (colunas_novas, comandos):
      - colunas_novas: ALTER TABLE de cada coluna nova (medidas + medidas_fonte)
      - comandos: lista de (sql, parametros) -> UPDATE das medidas da TACO, INSERT dos
        alimentos do IBGE e UPDATE das medidas do IBGE (para rodar de novo e atualizar)
    Os valores vão sempre como parâmetros (%s), nunca colados no texto do comando.
    """
    colunas_novas = {
        coluna: f"ALTER TABLE alimentos ADD COLUMN {coluna} DOUBLE NULL"
        for coluna in COLUNAS_MEDIDAS
    }
    colunas_novas["medidas_fonte"] = "ALTER TABLE alimentos ADD COLUMN medidas_fonte VARCHAR(20) NULL"

    colunas_medidas_banco = COLUNAS_MEDIDAS + ["medidas_fonte"]
    atribuicoes = ", ".join(f"{c} = %s" for c in colunas_medidas_banco)

    def parametros_medidas(linha):
        return [valor_parametro(linha[c]) for c in colunas_medidas_banco]

    comandos = []

    # TACO: os alimentos já existem no banco (data.sql) -> atualiza só as medidas. Todos os
    # alimentos entram (os sem medida ficam nulos), assim rodar de novo corrige valores antigos.
    sql_taco = f"UPDATE alimentos SET {atribuicoes} WHERE fonte = 'TACO' AND nome = %s"
    for _, linha in df_alimentos[df_alimentos["fonte"] == "TACO"].iterrows():
        comandos.append((sql_taco, parametros_medidas(linha) + [linha["nome"]]))

    # IBGE: novos alimentos, valores por 1 g (padrão do banco) + medidas.
    # A umidade não vai porque o IBGE não tem. O "WHERE NOT EXISTS" evita
    # duplicar o alimento se o script rodar mais de uma vez.
    colunas_banco = {c: f"{c}_1g" for c in COLUNAS_NUTRIENTES}
    colunas_banco["vitaminaC"] = colunas_banco.pop("vitaminac")  # nome usado no data.sql
    colunas_insert = ["fonte", "nome"] + list(colunas_banco) + colunas_medidas_banco
    marcadores = ", ".join(["%s"] * len(colunas_insert))
    sql_ibge_insert = (
        f"INSERT INTO alimentos ({', '.join(colunas_insert)}) "
        f"SELECT {marcadores} FROM DUAL "
        f"WHERE NOT EXISTS (SELECT 1 FROM alimentos WHERE fonte = 'IBGE' AND nome = %s)"
    )
    sql_ibge_update = f"UPDATE alimentos SET {atribuicoes} WHERE fonte = 'IBGE' AND nome = %s"

    # O backend busca alimento pelo nome exato (findByNome), então o nome não
    # pode se repetir: quando o IBGE tem o mesmo nome da TACO, ganha " (IBGE)"
    nomes_taco = set(df_alimentos.loc[df_alimentos["fonte"] == "TACO", "nome"])

    ibge = df_alimentos[df_alimentos["fonte"] == "IBGE"]
    nomes_ibge_finais = []
    for _, linha in ibge.iterrows():
        nome = linha["nome"] + " (IBGE)" if linha["nome"] in nomes_taco else linha["nome"]
        nomes_ibge_finais.append(nome)
        parametros = ["IBGE", nome]
        parametros += [valor_parametro(linha[coluna_df]) for coluna_df in colunas_banco.values()]
        parametros += parametros_medidas(linha)
        comandos.append((sql_ibge_insert, parametros + [nome]))
    assert len(set(nomes_ibge_finais)) == len(nomes_ibge_finais), "Nomes do IBGE repetidos depois do sufixo"

    for (_, linha), nome in zip(ibge.iterrows(), nomes_ibge_finais):
        comandos.append((sql_ibge_update, parametros_medidas(linha) + [nome]))

    return colunas_novas, comandos


def salvar_sql(colunas_novas, comandos, caminho):
    """Grava o script .sql para rodar no MySQL Workbench (os ALTER TABLE só valem na primeira vez)."""
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as arquivo:
        arquivo.write("-- Gerado por dados/ETL/tratamento.py - não editar à mão\n")
        arquivo.write("-- Medidas caseiras (Tabela de Medidas Referidas, IBGE/POF 2008-2009)\n")
        arquivo.write("-- e alimentos do IBGE (valores por 1 g, mesmo padrão do data.sql)\n")
        arquivo.write("-- medidas_fonte: IBGE | IBGE_REF_TACO | MAPEADO | ESTIMADO (valor aproximado)\n\n")
        arquivo.write("USE fittnutri;\n\n")
        arquivo.write("-- 1) Colunas novas: gramas de 1 unidade de cada medida do front + origem das medidas\n")
        arquivo.writelines(f"{comando};\n" for comando in colunas_novas.values())
        arquivo.write("\n-- 2) Medidas da TACO, 3) alimentos do IBGE e 4) medidas do IBGE\n")
        arquivo.writelines(f"{renderizar_sql(sql, parametros)};\n" for sql, parametros in comandos)


def salvar_relatorio(df, caminho):
    """Relatório de conferência: cada alimento com medida, o valor e a origem de cada uma."""
    colunas = ["fonte", "nome", "medidas_fonte"] + COLUNAS_MEDIDAS + COLUNAS_ORIGEM
    df.loc[df["medidas_fonte"].notna(), colunas].to_csv(
        caminho, index=False, sep=";", decimal=",", encoding="utf-8-sig"
    )


def aplicar_no_mysql(colunas_novas, comandos):
    """Executa os comandos no MySQL local, numa transação (ou tudo, ou nada)."""
    import mysql.connector

    conexao = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        database=os.getenv("DB_NAME", "fittnutri"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD") or getpass.getpass("Senha do MySQL: "),
        charset="utf8mb4",
    )
    cursor = conexao.cursor()

    # ALTER TABLE só para as colunas que ainda não existem (permite rodar de novo)
    cursor.execute(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alimentos'"
    )
    existentes = {nome.lower() for (nome,) in cursor.fetchall()}
    if not existentes:
        raise RuntimeError("Tabela 'alimentos' não encontrada. Suba o backend uma vez para criá-la.")

    # O data.sql usa "vitaminaC", mas o Hibernate pode ter criado "vitamina_c"
    if "vitaminac" not in existentes and "vitamina_c" in existentes:
        comandos = [(sql.replace("vitaminaC", "vitamina_c"), parametros) for sql, parametros in comandos]
    for coluna, comando in colunas_novas.items():
        if coluna not in existentes:
            cursor.execute(comando)  # ALTER TABLE faz commit sozinho no MySQL
            print("Coluna criada:", coluna)

    # Agrupa os comandos iguais (mesmo texto SQL) para executar cada grupo de uma vez
    grupos = {}
    for sql, parametros in comandos:
        grupos.setdefault(sql, []).append(parametros)

    try:
        for sql, lista in grupos.items():
            cursor.executemany(sql, lista)
        conexao.commit()
    except Exception:
        conexao.rollback()
        raise

    cursor.execute(
        "SELECT fonte, COUNT(*), SUM(medidas_fonte IS NOT NULL) FROM alimentos "
        "WHERE fonte IN ('TACO', 'IBGE') GROUP BY fonte"
    )
    for fonte, total, com_medida in cursor.fetchall():
        print(f"MySQL: {fonte}: {total} alimentos, {int(com_medida or 0)} com alguma medida")
    cursor.close()
    conexao.close()


class DadosInvalidos(Exception):
    """Os dados de origem têm um erro que impede a carga (ex.: nome repetido)."""


def processar():
    """
    Roda o tratamento inteiro e devolve os resultados num dicionário. Não imprime nem grava nada:
    é o que o main() e o notebook tratamento.ipynb usam, assim a lógica fica num lugar só.
    """
    df_medidas = extrair_medidas(CAMINHO_MEDIDAS)
    df_ibge_bruto = extrair_ibge(CAMINHO_IBGE)
    df_ibge = adicionar_medidas_ibge(transformar_ibge(df_ibge_bruto), df_medidas)

    df_taco = transformar_taco(extrair_taco(CAMINHO_TACO))
    df_taco = adicionar_medidas_taco(df_taco, df_ibge_bruto, df_medidas)
    mapa = carregar_mapa(CAMINHO_MAPA)
    df_taco = adicionar_medidas_mapeadas(df_taco, df_medidas, mapa)

    df = pd.concat([df_taco, df_ibge], ignore_index=True)
    complementares = carregar_complementares(CAMINHO_COMPLEMENTAR)
    df = adicionar_medidas_complementares(df, complementares)

    df, corrigidos = corrigir_negativos_pequenos(df)
    erros, alertas = validar_dados(df)
    if erros:
        raise DadosInvalidos("Dados com erro, nada foi gravado:\n  - " + "\n  - ".join(erros))
    df, descartadas = descartar_medidas_implausiveis(df)

    # As medianas usam só medidas reais do IBGE (nunca estimativas)
    medianas = calcular_medianas(df[df["fonte"] == "IBGE"])
    df = estimar_medidas(df, medianas)
    df["medidas_fonte"] = df.apply(fonte_geral, axis=1)
    df = adicionar_valores_por_grama(df)

    return {
        "alimentos": df,
        "medidas": df_medidas,
        "mapa": mapa,
        "complementares": complementares,
        "corrigidos": corrigidos,
        "alertas": alertas,
        "descartadas": descartadas,
        "medianas": medianas,
        "qtd_taco": len(df_taco),
        "qtd_ibge": len(df_ibge),
        "grupos_taco": df_taco["grupo"].nunique(),
    }


def main():
    parser = argparse.ArgumentParser(description="ETL da tabela de alimentos do FittNutri")
    parser.add_argument("--mysql", action="store_true", help="aplica o script SQL no MySQL local")
    args = parser.parse_args()

    try:
        r = processar()
    except DadosInvalidos as erro:
        raise SystemExit(str(erro))
    df_alimentos = r["alimentos"]

    print("Medidas caseiras:", len(r["medidas"]), "alimentos/preparações do IBGE")
    print("IBGE:", r["qtd_ibge"], "alimentos")
    print("TACO:", r["qtd_taco"], "alimentos em", r["grupos_taco"], "grupos;", len(r["mapa"]), "ligações no mapa TACO -> IBGE")
    print(len(r["complementares"]), "alimentos com valores aproximados de tabela externa (medidas_complementares.csv)")

    if r["corrigidos"]:
        print(f"\nNutrientes levemente negativos (resíduo de arredondamento) corrigidos para 0 ({len(r['corrigidos'])}):")
        for fonte, nome, coluna, valor in r["corrigidos"]:
            print(f"  - [{fonte}] {nome}: {coluna} = {valor:.3f} -> 0")
        print("  (a carga do ETL não altera os nutrientes da TACO; no banco eles seguem como estão no data.sql)")

    if r["alertas"]:
        print("\nAlertas de qualidade (não impedem a carga):")
        for alerta in r["alertas"]:
            print("  -", alerta)

    if r["descartadas"]:
        print(f"\nMedidas descartadas por passarem do limite ({len(r['descartadas'])}):")
        for fonte, nome, medida, valor in r["descartadas"]:
            print(f"  - [{fonte}] {nome}: {medida} = {valor:g} g")

    print("\nEstimativas por grupo (mediana das medidas reais do IBGE; grupos heterogêneos ficam de fora):")
    for (grupo, medida), (mediana, quantidade, dispersao) in sorted(r["medianas"].items()):
        print(f"  - {grupo:<11} {medida:<19} {mediana:6.1f} g  (n={quantidade}, dispersão {dispersao:.2f})")
    print("\nTotal:", len(df_alimentos), "alimentos\n")

    print("Valores nulos por coluna:")
    print(df_alimentos.groupby("fonte")[COLUNAS_ALIMENTOS].apply(lambda d: d.isna().sum()).T, "\n")

    print("Alimentos com cada medida caseira:")
    print(df_alimentos.groupby("fonte")[COLUNAS_MEDIDAS].count().T, "\n")

    print("Origem das medidas (quantidade de alimentos por origem, a menos confiável de cada um):")
    print(df_alimentos.groupby("fonte")["medidas_fonte"].value_counts(dropna=False).unstack(0).fillna(0).astype(int), "\n")
    print("REFERENCIA_EXTERNA e ESTIMADO = valores APROXIMADOS (tabela externa / cálculo do ETL), não são medidas reais.\n")

    # Exemplo com gramas dos modelos de dieta do grupo (backend/src/main/resources/data.sql):
    #   "3 colheres de sopa cheias" de arroz integral cozido = 60 g
    #   "2 colheres de sopa" de cenoura ralada crua          = 24 g
    print("Exemplo de porções em gramas:")
    print(pd.concat([
        calcular_porcao(df_alimentos, "Arroz, integral, cozido", 60),
        calcular_porcao(df_alimentos, "Cenoura, crua", 24),
    ], axis=1), "\n")

    # Exemplo com os gramas da Tabela de Medidas Referidas do IBGE
    print("Exemplo de porções em medida caseira:")
    print(pd.concat([
        calcular_medida(df_alimentos, "Arroz integral", "colher_sopa", 3),
        calcular_medida(df_alimentos, "Ovo de galinha - Cozido(a)", "unidade", 2),
        calcular_medida(df_alimentos, "Leite de vaca integral", "xicara", 1),
        calcular_medida(df_alimentos, "Acucar", "colher_cha", 2),
    ], axis=1), "\n")

    # sep=";" e decimal="," para abrir direto no Excel em português
    df_alimentos.to_csv(CAMINHO_SAIDA, index=False, sep=";", decimal=",", encoding="utf-8-sig")
    print("Arquivo salvo:", CAMINHO_SAIDA)
    salvar_relatorio(df_alimentos, CAMINHO_RELATORIO)
    print("Relatório de medidas salvo:", CAMINHO_RELATORIO)

    colunas_novas, comandos = montar_comandos_sql(df_alimentos)
    salvar_sql(colunas_novas, comandos, CAMINHO_SQL)
    print("Script SQL salvo:", CAMINHO_SQL)

    if args.mysql:
        aplicar_no_mysql(colunas_novas, comandos)


if __name__ == "__main__":
    main()
