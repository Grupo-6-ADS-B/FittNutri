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

export default function DataTable({ data }) {
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

  return (
    <TableContainer component={Paper} sx={{ p: 0, borderRadius: 2, maxHeight: 440 }}>
      <Table
        stickyHeader
        size="small"
        aria-label="dados do paciente"
        sx={{ '& .MuiTableCell-root': { borderColor: '#e8f5e9' } }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#2e7d32', color: '#fff', fontSize: '0.82rem', py: 1 }}>
              Indicador
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#2e7d32', color: '#fff', fontSize: '0.82rem', py: 1 }}>
              Resultado
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#2e7d32', color: '#fff', fontSize: '0.82rem', py: 1, width: 130 }}>
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const badge = row.type ? getClassificacao(row.type, row.rawValue) : null;
            const isEmpty = row.value === null || row.value === undefined || row.value === '' || String(row.value).startsWith('null') || String(row.value).startsWith('undefined');
            return (
              <TableRow
                key={row.label}
                sx={{
                  bgcolor: index % 2 === 0 ? '#f0f7f1' : '#ffffff',
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: '#dcedc8' },
                  transition: 'background-color 0.15s',
                }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: badge ? 600 : 400, fontSize: '0.82rem', py: 0.8 }}>
                  {row.label}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: badge ? 700 : 400, py: 0.8 }}>
                  {isEmpty ? '—' : row.value}
                </TableCell>
                <TableCell align="center" sx={{ py: 0.8 }}>
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
                        border: `1px solid ${badge.color}33`,
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
