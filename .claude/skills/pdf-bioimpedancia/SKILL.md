# Skill: Geração de PDF de Bioimpedância — FittNutri

## Quando usar
Use esta skill ao criar ou modificar relatórios PDF de bioimpedância/composição corporal no projeto FittNutri.

## Stack técnica
- **Biblioteca:** OpenPDF (com.lowagie.text) — fork open-source do iText
- **Backend:** Spring Boot 3 / Java 21
- **Arquivo principal:** `backend/src/main/java/fitt_nutri/example/demo/service/BioimpedancePdfService.java`

## Paleta de cores oficial

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| Verde escuro | #2E7D32 | (46, 125, 50) | Headers, títulos de seção, valores positivos |
| Verde claro | #E8F5E9 | (232, 245, 233) | Fundo de seções |
| Verde header | #DCF5DC | (220, 245, 220) | Cabeçalhos de tabela |
| Verde status | #C8E6C9 | (200, 230, 201) | Classificação "Normal/Eutrofia" |
| Amarelo status | #FFF9C4 | (255, 249, 196) | Classificação "Atenção/Sobrepeso" |
| Vermelho status | #FFCDCE | (255, 205, 210) | Classificação "Crítico/Obesidade" |
| Corpo fill | #C8D7E6 | (200, 215, 230) | Preenchimento da silhueta corporal |
| Corpo outline | #8CA0B4 | (140, 160, 180) | Contorno da silhueta |

## Fontes padrão

| Tipo | Fonte | Tamanho | Estilo |
|------|-------|---------|--------|
| Título principal | Helvetica | 18pt | Bold, branco |
| Título de seção | Helvetica | 13pt | Bold, verde escuro |
| Cabeçalho tabela | Helvetica | 10pt | Bold |
| Texto normal | Helvetica | 10pt | Normal |
| Texto pequeno | Helvetica | 9pt | Normal |
| Labels do boneco | Helvetica | 8pt | Bold, cinza escuro |
| Valores do boneco | Helvetica | 9pt | Bold, verde escuro |
| Rodapé | Helvetica | 11pt | Bold, cinza |

## Estrutura obrigatória do relatório

### Página 1 — Visual
1. **Header** — Barra verde com título "RELATÓRIO DE BIOIMPEDÂNCIA"
2. **Info do paciente** — Nome, data avaliação, sexo, nutricionista + CRN
3. **Mapa Corporal** — Silhueta com 7 circunferências (braço, cintura, abdominal, quadril, coxa, panturrilha, pulso)
4. **Cards de classificação** — IMC, Gordura Corporal, Gordura Visceral, Massa Muscular
5. **Gráfico de composição** — Pizza mostrando % gordura vs % massa magra

### Página 2 — Dados
6. **Dados Calculados** — Tabela com todos os valores antropométricos
7. **Circunferências detalhadas** — Tabela com todas as circunferências
8. **Classificações** — Tabela com indicador, valor e classificação colorida
9. **Valores de Referência** — Baseados no sexo do paciente
10. **Evolução** — Tabela comparativa (se >1 consulta) com destaque de cores
11. **Conclusão** — Texto auto-gerado baseado nas classificações
12. **Rodapé** — Nome e CRN do nutricionista

## Técnicas de desenho

### Silhueta corporal
- Usar `PdfContentByte` com curvas bezier (`curveTo`) para contorno suave
- Diferenciar masculino (ombros mais largos) vs feminino (quadril mais largo)
- 7 pontos numerados conectados por linhas tracejadas (`setLineDash(3f, 2f)`)
- Ponto verde (`circle` + `fill`) no corpo, linha tracejada até o label

### Gráfico de pizza
- Usar `PdfContentByte.arc()` para arcos
- Vermelho: massa de tecido adiposo (%)
- Azul/verde: massa livre de gordura (%)
- Labels com valores percentuais

### Cards de classificação
- `roundRectangle` com raio 4f
- Barra lateral colorida (4px) indicando status
- Ícone Unicode de status: ✓ (normal), ⚠ (atenção), ✗ (crítico)

### Posicionamento absoluto
- Usar `ColumnText` para texto posicionado
- `writer.getVerticalPosition(true)` para pegar posição Y atual
- Coordenadas PDF: Y cresce de baixo para cima

## Regras de null-safety

SEMPRE verificar null antes de acessar qualquer campo:
```java
// CORRETO
Double imc = a != null ? a.getImc() : null;
String valor = imc != null ? format(imc) + " kg/m²" : "-";

// INCORRETO — vai dar NPE
String valor = format(a.getImc()) + " kg/m²";
```

## Classificações clínicas

### IMC (OMS)
| Faixa | Classificação | Cor |
|-------|--------------|-----|
| < 18.5 | Magreza | Amarelo |
| 18.5 - 24.9 | Eutrofia | Verde |
| 25.0 - 29.9 | Sobrepeso | Amarelo |
| 30.0 - 34.9 | Obesidade I | Vermelho |
| 35.0 - 39.9 | Obesidade II | Vermelho |
| ≥ 40.0 | Obesidade III | Vermelho |

### Gordura Corporal
| Sexo | Faixa Normal |
|------|-------------|
| Feminino | 21.0% - 32.9% |
| Masculino | 8.0% - 19.9% |

### Gordura Visceral
| Faixa | Classificação |
|-------|--------------|
| 1 - 9 | Normal |
| 10 - 14 | Alto |
| ≥ 15 | Muito Alto |

## Dados disponíveis no modelo

### AnthropometricDataModel
peso, altura, idade, imc, porcentagemGordura, massaMuscular, gorduraVisceral, taxaMetabolicaBasal, idadeMetabolica

### DataCircleModel
abdominal, cintura, quadril, pulso, panturrilha, braco, coxa, pesoIdeal

### PatientModel
nome, email, cpf, telefone, sexo, etnia, atividade

### UserModel (nutricionista)
nome, email, crn
