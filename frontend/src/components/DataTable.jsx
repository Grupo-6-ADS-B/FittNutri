import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function DataTable({ data }) {
  const rows = [
    {label: 'Data da Consulta', value: data?.dataConsulta },
    { label: 'Peso', value: `${data?.peso} kg` },
    { label: 'IMC', value: data?.imc },
    { label: 'Gordura', value: `${data?.gordura}%` },
    { label: 'Gordura Visceral', value: `${data?.gorduraVisceral}%` },
    { label: 'Massa Muscular', value: `${data?.massaMuscular} %` },
    { label: 'Altura', value: `${data?.altura} cm` },
    { label: 'Idade Metabólica', value: `${data?.idadeMetabolica} anos` },
    { label: 'Taxa Metabólica Basal', value: `${data?.taxaMetabolicaBasal} kcal` },
    { label: 'Atividade', value: data?.atividade },
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
