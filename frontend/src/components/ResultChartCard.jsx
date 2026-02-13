import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export function ResultChartCard({ evolution }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Pega o último registro de evolução para Peso Atual e Peso Ideal
  const evoSorted = [...evolution].sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta));
  let pesoAtual = '-';
  let pesoIdeal = '-';
  if (evoSorted.length) {
    const last = evoSorted[evoSorted.length - 1];
    pesoAtual = last.peso ?? '-';
    pesoIdeal = last.pesoIdeal ?? '-';
  }
  if (pesoAtual === '-' && pesoIdeal === '-') {
    pesoAtual = 78;
    pesoIdeal = 72;
  }
  const pesoData = [pesoAtual, pesoIdeal];
  let evoLabels = ['1° consulta', '2° consulta'];
  let evoDates = ['', ''];
  if (evoSorted.length) {
    evoLabels = evoSorted.map((e, idx) => `${idx+1}° consulta`);
    evoDates = evoSorted.map(e => {
      const data = e.dataConsulta ? new Date(e.dataConsulta) : null;
      return data && !isNaN(data) ? `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth()+1).padStart(2, '0')}` : '';
    });
    if (evoLabels.length === 1) evoLabels.push('2° consulta');
    if (evoDates.length === 1) evoDates.push('');
  }
  const width = 1100;
  const height = 350;
  const padding = 50;
  const rightPadding = 100;
  const numPesoData = pesoData.map(v => Number(v)).filter(v => !isNaN(v));
  const minPeso = Math.min(...numPesoData) - 1;
  const maxPeso = Math.max(...numPesoData) + 1;
  const getY = (peso) => padding + ((maxPeso - peso) / (maxPeso - minPeso)) * (height - padding * 2);
  const getX = (i) => padding + i * ((width - padding - rightPadding) / (pesoData.length - 1));
  const points = pesoData.map((peso, i) => `${getX(i)},${getY(Number(peso))}`).join(' ');

  return (
    <Card sx={{ p: 2, boxShadow: 3, mb: 2}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8 }}>Evolução do Peso</Typography>
      </Box>
      <Box sx={{ width: width, height: height + 40, position: 'relative' }}>
        <svg width={width} height={height} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #eee' }}>
          {numPesoData.map((val, idx) => (
            <g key={val}>
              <text x={18} y={getY(val)+4} fontSize="13" fill="#888">{val}</text>
              <line x1={padding-10} y1={getY(val)} x2={width-rightPadding+10} y2={getY(val)} stroke="#eee" strokeDasharray="2 2" />
            </g>
          ))}
          <polyline
            fill="none"
            stroke={primary}
            strokeWidth="4"
            points={points}
          />
          {pesoData.map((peso, i) => (
            <circle key={i} cx={getX(i)} cy={getY(Number(peso))} r={8} fill={secondary} />
          ))}
          {evoLabels.map((label, i) => (
            <g key={label}>
              <text x={getX(i)} y={height-30} fontSize="16" textAnchor="middle" fill="#888">{label}</text>
              <text x={getX(i)} y={height-10} fontSize="14" textAnchor="middle" fill="#aaa">{evoDates[i]}</text>
            </g>
          ))}
        </svg>
      </Box>
    </Card>
  );
}
