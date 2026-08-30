import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

function getClassificacao(type, value) {
  if (value == null || value === '' || isNaN(Number(value))) return null;
  const v = Number(value);

  if (type === 'imc') {
    if (v < 18.5) return { label: 'Abaixo do peso', color: '#1565c0', bg: '#e3f2fd' };
    if (v < 25)   return { label: 'Normal',          color: '#2e7d32', bg: '#e8f5e9' };
    if (v < 30)   return { label: 'Sobrepeso',        color: '#e65100', bg: '#fff3e0' };
    return               { label: 'Obeso',            color: '#c62828', bg: '#ffebee' };
  }
  if (type === 'gordura') {
    if (v < 15)  return { label: 'Baixo',   color: '#1565c0', bg: '#e3f2fd' };
    if (v < 25)  return { label: 'Normal',  color: '#2e7d32', bg: '#e8f5e9' };
    if (v <= 32) return { label: 'Alto',    color: '#e65100', bg: '#fff3e0' };
    return              { label: 'Crítico', color: '#c62828', bg: '#ffebee' };
  }
  if (type === 'gorduraVisceral') {
    if (v <= 9)  return { label: 'Normal',  color: '#2e7d32', bg: '#e8f5e9' };
    if (v <= 14) return { label: 'Alto',    color: '#e65100', bg: '#fff3e0' };
    return              { label: 'Crítico', color: '#c62828', bg: '#ffebee' };
  }
  if (type === 'massaMuscular') {
    if (v >= 75) return { label: 'Ótimo',  color: '#2e7d32', bg: '#e8f5e9' };
    if (v >= 60) return { label: 'Normal', color: '#2e7d32', bg: '#e8f5e9' };
    return              { label: 'Baixo',  color: '#e65100', bg: '#fff3e0' };
  }
  return null;
}

export default function DataTable({ data, embedded = false }) {
  const capitalizeFirstLetter = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const formatHeight = (heightValue) => {
    if (heightValue === null || heightValue === undefined || heightValue === '') return null;

    const normalized = String(heightValue).replace(',', '.').trim();
    const numericHeight = Number(normalized);
    if (Number.isNaN(numericHeight)) return `${heightValue} cm`;

    const heightInCm = numericHeight <= 3 ? numericHeight * 100 : numericHeight;
    return `${Math.round(heightInCm)} cm`;
  };

  const rows = [
    { label: 'Data da Consulta',      value: data?.dataConsulta,                          rawValue: null,                  type: null },
    { label: 'Motivo da Consulta',    value: data?.motivoConsulta,                        rawValue: null,                  type: null },
    { label: 'Peso',                  value: `${data?.peso} kg`,                          rawValue: null,                  type: null },
    { label: 'IMC',                   value: data?.imc,                                   rawValue: data?.imc,             type: 'imc' },
    { label: 'Gordura',               value: `${data?.gordura}%`,                         rawValue: data?.gordura,         type: 'gordura' },
    { label: 'Gordura Visceral',      value: `${data?.gorduraVisceral}%`,                 rawValue: data?.gorduraVisceral, type: 'gorduraVisceral' },
    { label: 'Massa Muscular',        value: `${data?.massaMuscular} %`,                  rawValue: data?.massaMuscular,   type: 'massaMuscular' },
    { label: 'Altura',                value: formatHeight(data?.altura),                  rawValue: null,                  type: null },
    { label: 'Idade Metabólica',      value: `${data?.idadeMetabolica} anos`,             rawValue: null,                  type: null },
    { label: 'Taxa Metabólica Basal', value: `${data?.taxaMetabolicaBasal} kcal`,         rawValue: null,                  type: null },
    { label: 'Atividade',             value: capitalizeFirstLetter(data?.atividade),       rawValue: null,                  type: null },
    { label: 'Cintura',               value: `${data?.cintura} cm`,                       rawValue: null,                  type: null },
    { label: 'Abdominal',             value: `${data?.abdominal} cm`,                     rawValue: null,                  type: null },
    { label: 'Quadril',               value: `${data?.quadril} cm`,                       rawValue: null,                  type: null },
    { label: 'Braço',                 value: `${data?.braco} cm`,                         rawValue: null,                  type: null },
    { label: 'Coxa',                  value: `${data?.coxa} cm`,                          rawValue: null,                  type: null },
    { label: 'Panturrilha',           value: `${data?.panturrilha} cm`,                   rawValue: null,                  type: null },
    { label: 'Peso Ideal',            value: `${data?.pesoIdeal} kg`,                     rawValue: null,                  type: null },
    { label: 'Pulso',                 value: `${data?.pulso} cm`,                         rawValue: null,                  type: null },
  ];

  const headerCellSx = {
    fontWeight: 700,
    bgcolor: 'rgba(46, 125, 50, 0.06)',
    color: '#2e7d32',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    py: 1.4,
    borderBottom: '2px solid #2e7d32',
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        p: 0,
        borderRadius: embedded ? 2 : 2.5,
        maxHeight: 440,
        border: embedded ? 'none' : '1px solid rgba(46, 125, 50, 0.08)',
        boxShadow: 'none',
        bgcolor: 'transparent',
      }}
    >
      <Table
        stickyHeader
        size="small"
        aria-label="dados do paciente"
        sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(46, 125, 50, 0.06)' } }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellSx}>Indicador</TableCell>
            <TableCell align="right" sx={headerCellSx}>Resultado</TableCell>
            <TableCell align="center" sx={{ ...headerCellSx, width: 130 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const badge = row.type ? getClassificacao(row.type, row.rawValue) : null;
            const isEmpty = row.value === null || row.value === undefined || row.value === '' || String(row.value).startsWith('null') || String(row.value).startsWith('undefined');
            return (
              <TableRow
                key={row.label}
                sx={{
                  bgcolor: '#ffffff',
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.04)' },
                  transition: 'background-color 0.15s',
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 500, fontSize: '0.85rem', py: 1.2, color: 'text.secondary' }}
                >
                  {row.label}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: badge ? 700 : 600,
                    py: 1.2,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'text.primary',
                  }}
                >
                  {isEmpty ? '—' : row.value}
                </TableCell>
                <TableCell align="center" sx={{ py: 1.2 }}>
                  {badge ? (
                    <Chip
                      label={badge.label}
                      size="small"
                      sx={{
                        bgcolor: badge.bg,
                        color: badge.color,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 22,
                        borderRadius: 1.5,
                        border: 'none',
                      }}
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
