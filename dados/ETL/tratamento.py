"""
ETL da tabela de alimentos do FittNutri.

Lê as tabelas TACO (TACO.xlsx) e IBGE/POF 2008-2009 (IBGE.xls), limpa os
valores, padroniza as colunas com os nomes da tabela "alimentos" do banco,
junta as duas fontes, acrescenta os gramas das medidas caseiras usadas no
front (Tabela de Medidas Referidas do IBGE, tabelamedidas_bd.xls) e calcula
os nutrientes por 1 g.

Mesma lógica do notebook tratamento.ipynb.

Uso (a partir da pasta dados/ETL):
    python tratamento.py           -> trata os dados, salva o CSV e o script SQL
    python tratamento.py --mysql   -> faz o mesmo e aplica o script no MySQL local

Conexão com o MySQL (variáveis de ambiente, com os mesmos padrões do backend):
    DB_HOST (localhost), DB_PORT (3306), DB_NAME (fittnutri), DB_USER (root)
    DB_PASSWORD -> se não existir, a senha é pedida no terminal
"""
import argparse
import getpass
import os
from pathlib import Path

import numpy as np
import pandas as pd

PASTA = Path(__file__).parent
CAMINHO_TACO = PASTA / "TACO.xlsx"
CAMINHO_IBGE = PASTA / "IBGE.xls"
# Tabela de Medidas Referidas para os Alimentos Consumidos no Brasil (POF 2008-2009)
# https://ftp.ibge.gov.br/Orcamentos_Familiares/Pesquisa_de_Orcamentos_Familiares_2008_2009/Tabela_de_Medidas_Referidas_para_os_Alimentos_Consumidos_no_Brasil/
CAMINHO_MEDIDAS = PASTA / "tabelamedidas_bd.xls"
CAMINHO_SAIDA = PASTA / "alimentos_tratados.csv"
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

# Legenda da TACO / IBGE:
#   Tr  = traço (valor muito pequeno, arredondado)  -> nulo
#   *   = análise sendo reavaliada                  -> nulo
#   NA  = não se aplica                             -> nulo
#   -   = sem informação (IBGE)                     -> nulo
#   " " = análise não solicitada                    -> nulo
VALORES_NULOS = {"", "Tr", "*", "NA", "-"}


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


def adicionar_medidas_ibge(df_ibge, df_medidas):
    """Liga as medidas aos alimentos do IBGE pelo código do alimento + código da preparação."""
    return df_ibge.merge(df_medidas, on=["codigo_origem", "codigo_preparacao"], how="left")


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
    return df_taco.merge(medidas_taco, on="nome", how="left")


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
    """Converte um valor do pandas em literal SQL (nulo -> NULL, texto entre aspas)."""
    if valor is None or (isinstance(valor, float) and np.isnan(valor)):
        return "NULL"
    if isinstance(valor, str):
        return "'" + valor.replace("'", "''") + "'"
    return repr(round(float(valor), 6))


def montar_comandos_sql(df_alimentos):
    """
    Monta os comandos para o MySQL. Atenção ao padrão do banco: o data.sql do
    backend insere a TACO por 100 g e depois DIVIDE tudo por 100, ou seja, a
    tabela "alimentos" guarda os nutrientes POR 1 g. Por isso o IBGE entra com
    as colunas *_1g. As medidas caseiras ficam em gramas (não são divididas).

    Retorna (colunas_novas, comandos):
      - colunas_novas: ALTER TABLE de cada coluna de medida
      - comandos: UPDATE das medidas da TACO + INSERT dos alimentos do IBGE
    """
    colunas_novas = {
        coluna: f"ALTER TABLE alimentos ADD COLUMN {coluna} DOUBLE NULL"
        for coluna in COLUNAS_MEDIDAS
    }

    comandos = []

    # TACO: os alimentos já existem no banco (data.sql) -> só preenche as medidas
    taco = df_alimentos[(df_alimentos["fonte"] == "TACO")].dropna(subset=COLUNAS_MEDIDAS, how="all")
    for _, linha in taco.iterrows():
        sets = ", ".join(f"{c} = {valor_sql(linha[c])}" for c in COLUNAS_MEDIDAS)
        comandos.append(
            f"UPDATE alimentos SET {sets} WHERE fonte = 'TACO' AND nome = {valor_sql(linha['nome'])}"
        )

    # IBGE: novos alimentos, valores por 1 g (padrão do banco) + medidas.
    # A umidade não vai porque o IBGE não tem. O "WHERE NOT EXISTS" evita
    # duplicar o alimento se o script rodar mais de uma vez.
    colunas_banco = {c: f"{c}_1g" for c in COLUNAS_NUTRIENTES}
    colunas_banco["vitaminaC"] = colunas_banco.pop("vitaminac")  # nome usado no data.sql
    colunas_insert = ["fonte", "nome"] + list(colunas_banco) + COLUNAS_MEDIDAS

    # O backend busca alimento pelo nome exato (findByNome), então o nome não
    # pode se repetir: quando o IBGE tem o mesmo nome da TACO, ganha " (IBGE)"
    nomes_taco = set(df_alimentos.loc[df_alimentos["fonte"] == "TACO", "nome"])

    ibge = df_alimentos[df_alimentos["fonte"] == "IBGE"]
    for _, linha in ibge.iterrows():
        nome = linha["nome"] + " (IBGE)" if linha["nome"] in nomes_taco else linha["nome"]
        valores = [valor_sql("IBGE"), valor_sql(nome)]
        valores += [valor_sql(linha[coluna_df]) for coluna_df in colunas_banco.values()]
        valores += [valor_sql(linha[c]) for c in COLUNAS_MEDIDAS]
        comandos.append(
            f"INSERT INTO alimentos ({', '.join(colunas_insert)}) "
            f"SELECT {', '.join(valores)} FROM DUAL "
            f"WHERE NOT EXISTS (SELECT 1 FROM alimentos WHERE fonte = 'IBGE' AND nome = {valor_sql(nome)})"
        )

    return colunas_novas, comandos


def salvar_sql(colunas_novas, comandos, caminho):
    """Grava o script .sql para rodar no MySQL Workbench (rodar uma vez só por causa do ALTER TABLE)."""
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as arquivo:
        arquivo.write("-- Gerado por dados/ETL/tratamento.py - não editar à mão\n")
        arquivo.write("-- Medidas caseiras (Tabela de Medidas Referidas, IBGE/POF 2008-2009)\n")
        arquivo.write("-- e alimentos do IBGE (valores por 1 g, mesmo padrão do data.sql)\n\n")
        arquivo.write("USE fittnutri;\n\n")
        arquivo.write("-- 1) Colunas das medidas do front (gramas de 1 unidade da medida)\n")
        arquivo.writelines(f"{comando};\n" for comando in colunas_novas.values())
        arquivo.write("\n-- 2) Medidas da TACO e 3) alimentos do IBGE\n")
        arquivo.writelines(f"{comando};\n" for comando in comandos)


def aplicar_no_mysql(colunas_novas, comandos):
    """Executa os comandos no MySQL local, numa transação (ou tudo, ou nada)."""
    import mysql.connector

    conexao = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        database=os.getenv("DB_NAME", "fittnutri"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD") or getpass.getpass("Senha do MySQL: "),
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
        comandos = [c.replace("vitaminaC", "vitamina_c") for c in comandos]
    for coluna, comando in colunas_novas.items():
        if coluna not in existentes:
            cursor.execute(comando)  # ALTER TABLE faz commit sozinho no MySQL
            print("Coluna criada:", coluna)

    try:
        atualizados = inseridos = 0
        for comando in comandos:
            cursor.execute(comando)
            if comando.startswith("UPDATE"):
                atualizados += cursor.rowcount
            else:
                inseridos += cursor.rowcount
        conexao.commit()
    except Exception:
        conexao.rollback()
        raise
    finally:
        cursor.close()
        conexao.close()

    print(f"MySQL: {atualizados} alimentos da TACO com medidas, {inseridos} alimentos do IBGE inseridos")


def main():
    parser = argparse.ArgumentParser(description="ETL da tabela de alimentos do FittNutri")
    parser.add_argument("--mysql", action="store_true", help="aplica o script SQL no MySQL local")
    args = parser.parse_args()

    df_medidas = extrair_medidas(CAMINHO_MEDIDAS)
    print("Medidas caseiras:", len(df_medidas), "alimentos/preparações do IBGE")

    df_ibge_bruto = extrair_ibge(CAMINHO_IBGE)
    df_ibge = adicionar_medidas_ibge(transformar_ibge(df_ibge_bruto), df_medidas)
    print("IBGE:", len(df_ibge), "alimentos")

    df_taco = transformar_taco(extrair_taco(CAMINHO_TACO))
    df_taco = adicionar_medidas_taco(df_taco, df_ibge_bruto, df_medidas)
    print("TACO:", len(df_taco), "alimentos em", df_taco["grupo"].nunique(), "grupos")

    df_alimentos = pd.concat([df_taco, df_ibge], ignore_index=True)
    df_alimentos = adicionar_valores_por_grama(df_alimentos)
    print("Total:", len(df_alimentos), "alimentos\n")

    print("Valores nulos por coluna:")
    print(df_alimentos.groupby("fonte")[COLUNAS_ALIMENTOS].apply(lambda d: d.isna().sum()).T, "\n")

    print("Alimentos com cada medida caseira:")
    print(df_alimentos.groupby("fonte")[COLUNAS_MEDIDAS].count().T, "\n")

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

    colunas_novas, comandos = montar_comandos_sql(df_alimentos)
    salvar_sql(colunas_novas, comandos, CAMINHO_SQL)
    print("Script SQL salvo:", CAMINHO_SQL)

    if args.mysql:
        aplicar_no_mysql(colunas_novas, comandos)


if __name__ == "__main__":
    main()
