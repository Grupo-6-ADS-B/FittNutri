import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
    {label: 'Data da Consulta', value: data?.dataConsulta },
    { label: 'Peso', value: `${data?.peso} kg` },
    { label: 'IMC', value: data?.imc },
    { label: 'Gordura', value: `${data?.gordura}%` },
    { label: 'Gordura Visceral', value: `${data?.gorduraVisceral}%` },
    { label: 'Massa Muscular', value: `${data?.massaMuscular} %` },
    { label: 'Altura', value: formatHeight(data?.altura) },
    { label: 'Idade Metabólica', value: `${data?.idadeMetabolica} anos` },
    { label: 'Taxa Metabólica Basal', value: `${data?.taxaMetabolicaBasal} kcal` },
    { label: 'Atividade', value: capitalizeFirstLetter(data?.atividade) },
    { label: 'Cintura', value: `${data?.cintura} cm` },
    { label: 'Abdominal', value: `${data?.abdominal} cm` },
    { label: 'Quadril', value: `${data?.quadril} cm` },
    { label: 'Braço', value: `${data?.braco} cm` },
    { label: 'Coxa', value: `${data?.coxa} cm` },
    { label: 'Panturrilha', value: `${data?.panturrilha} cm` },
    { label: 'Peso Ideal', value: `${data?.pesoIdeal} kg` },
    { label: 'Pulso', value: `${data?.pulso} cm` },
  ];

  return (
    <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2 }}>
      <Table
        aria-label="dados do paciente"
        sx={{
          '& .MuiTableCell-root': { borderColor: '#f1f1f1' },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Indicador</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              Resultado
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.label}
              sx={{
                '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                '&:last-child td, &:last-child th': { border: 0 },
              }}
            >
              <TableCell component="th" scope="row">
                {row.label}
              </TableCell>
              <TableCell align="right">
                {row.value === null || row.value === undefined || row.value === '' ? '-' : row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
