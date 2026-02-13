import React, { useState } from 'react';
import { Box, CssBaseline, Grid, Card, Typography, Avatar, Button, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BalanceIcon from '@mui/icons-material/Balance';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { KPICard } from '../components/KPICard';
import { ResultChartCard as ResultChartCardImport } from '../components/ResultChartCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [evolution, setEvolution] = useState([]);
  const [kpiValues, setKpiValues] = useState({ imc: '-', gordura: '-', massaMuscular: '-', gorduraVisceral: '-' });
  const [dateRange, setDateRange] = useState({ from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() });
  const userId = location.state?.userId;

  const fetchEvolution = async (userId) => {
    if (!userId) return;
    try {
      const response = await api.get(`/evolution/${userId}`, {
        params: {
          startDate: dateRange.from.toISOString().split('T')[0],
          endDate: dateRange.to.toISOString().split('T')[0],
        }
      });
      setEvolution(response.data);
    } catch (err) {
      console.error('Erro ao buscar evolução:', err);
      alert(`Erro: ${err.message}`);
      setEvolution([]);
    }
  };

  const kpiData = [
    { title: 'IMC', value: kpiValues.imc, icon: FactCheckIcon, colorKey: 'primary' },
    { title: 'Gordura (%)', value: kpiValues.gordura, icon: BalanceIcon, colorKey: 'primary' },
    { title: 'Massa Muscular', value: kpiValues.massaMuscular, icon: FitnessCenterIcon, colorKey: 'secondary' },
    { title: 'Gordura Visceral', value: kpiValues.gorduraVisceral, icon: ManageAccountsIcon, colorKey: 'primary' },
  ];

  const ResultChartCard = () => {
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
    // Se não houver dados, usa valores fictícios
    if (pesoAtual === '-' && pesoIdeal === '-') {
      pesoAtual = 78;
      pesoIdeal = 72;
    }
    // Dados do gráfico
    const pesoData = [pesoAtual, pesoIdeal];
    let labels = ['1° consulta', '2° consulta'];
    // Se houver dados de evolução, use as datas reais
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
    // Garante que ambos são números para o gráfico
    const numPesoData = pesoData.map(v => Number(v)).filter(v => !isNaN(v));
    const minPeso = Math.min(...numPesoData) - 1;
    const maxPeso = Math.max(...numPesoData) + 1;
    const getY = (peso) => padding + ((maxPeso - peso) / (maxPeso - minPeso)) * (height - padding * 2);
    const getX = (i) => padding + i * ((width - padding - rightPadding) / (pesoData.length - 1));
    const points = pesoData.map((peso, i) => `${getX(i)},${getY(Number(peso))}`).join(' ');
    const [showSelect, setShowSelect] = React.useState(false);
    return (
      <Card sx={{ p: 2, boxShadow: 3, mb: 2}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8 }}>Evolução do Peso</Typography>
          {!showSelect ? (
            <Chip
              icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
              label="Ver metas"
              onClick={() => setShowSelect(true)}
              sx={{ bgcolor: secondary, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            />
          ) : (
            <Box sx={{ display: 'flex', gap: 1.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#ff9800', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 14, boxShadow: 1 }}>
                Peso Atual:&nbsp;{pesoAtual} kg
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#4caf50', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 14, boxShadow: 1 }}>
                Peso Ideal:&nbsp;{pesoIdeal} kg
              </Box>
              <Button size="small" variant="outlined" color="secondary" sx={{ ml: 1, minWidth: 0, px: 1, fontSize: 13, py: 0.2 }} onClick={() => setShowSelect(false)}>Fechar</Button>
            </Box>
          )}
        </Box>
        <Box sx={{ width: width, height: height + 40, position: 'relative' }}>
          <svg width={width} height={height} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #eee' }}>
            {/* Eixos Y */}
            {numPesoData.map((val, idx) => (
              <g key={val}>
                <text x={18} y={getY(val)+4} fontSize="13" fill="#888">{val}</text>
                <line x1={padding-10} y1={getY(val)} x2={width-rightPadding+10} y2={getY(val)} stroke="#eee" strokeDasharray="2 2" />
              </g>
            ))}
            {/* Linha do gráfico */}
            <polyline
              fill="none"
              stroke={primary}
              strokeWidth="4"
              points={points}
            />
            {/* Pontos */}
            {pesoData.map((peso, i) => (
              <circle key={i} cx={getX(i)} cy={getY(Number(peso))} r={8} fill={secondary} />
            ))}
            {/* Eixo X: Consulta dinâmica e data abaixo */}
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
  };

  // const DonutChartCard = () => {
  //   const theme = useTheme();
  //   const primary = theme.palette.primary.main;
  //   const secondary = theme.palette.secondary.main;
  //
  //   const legendData = [
  //     { label: 'Carboidratos', value: 40, color: secondary },
  //     { label: 'Proteínas', value: 35, color: primary },
  //     { label: 'Gorduras', value: 25, color: '#FFD700' },
  //   ];
  //
  //   return (
  //     <Card sx={{ p: 2, boxShadow: 3, height: 388, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
  //       <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8 }}>Distribuição de Macronutrientes</Typography>
  //
  //       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
  //         <Box sx={{ width: 170, height: 160, position: 'relative', my: 2 }}>
  //           <Box sx={{
  //             width: '100%',
  //             height: '100%',
  //             borderRadius: '50%',
  //             background: `conic-gradient(${secondary} 0deg, ${secondary} 120deg, ${primary} 120deg, ${primary} 240deg, #FFD700 240deg, #FFD700 360deg)`,
  //             display: 'flex',
  //             alignItems: 'center',
  //             justifyContent: 'center'
  //           }} />
  //           <Box sx={{
  //             position: 'absolute',
  //             top: '50%',
  //             left: '50%',
  //             transform: 'translate(-50%, -50%)',
  //             width: 100,
  //             height: 100,
  //             borderRadius: '50%',
  //             bgcolor: 'white'
  //           }} />
  //           <Typography variant="h4" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: primary }}>100%</Typography>
  //         </Box>
  //
  //         <Box sx={{ mt: 2 }}>
  //           {legendData.map((item) => (
  //             <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 1, gap: 1.5 }}>
  //               <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: item.color, mr: 1, border: '2px solid #eee' }} />
  //               <Typography variant="body2" sx={{ minWidth: 90 }}>{item.label}</Typography>
  //               <Typography variant="body2" fontWeight="bold" color="text.secondary">{item.value}%</Typography>
  //             </Box>
  //           ))}
  //         </Box>
  //       </Box>
  //     </Card>
  //   );
  // };

  const ConsultasBarChart = () => {
    const consultas = [
      { data: '12/06', qtd: 2 },
      { data: '15/06', qtd: 1 },
      { data: '18/06', qtd: 3 },
      { data: '22/06', qtd: 1 },
      { data: '25/06', qtd: 2 },
      { data: '28/06', qtd: 1 },
      { data: '30/06', qtd: 4 },
    ];
    const theme = useTheme();
    const green = theme.palette.primary.main;

    return (
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>Histórico de consultas</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 180, gap: 7, pl: 2, pr: 2, bgcolor: '#f8fff9', borderRadius: 2, boxShadow: 1 }}>
          {consultas.map((c, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>{c.data}</Typography>
              <Box sx={{ width: 28, height: `${c.qtd * 32}px`, bgcolor: green, borderRadius: 2, boxShadow: 2, mb: 0.5 }} />
              <Typography variant="caption" sx={{ color: green, fontWeight: 'bold' }}>{c.qtd}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  function CalendarCard() {
    return (
      <Box sx={{ width: 540 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Calendário</Typography>
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#f8fff9', boxShadow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Data Início</Typography>
            <input
              type="date"
              value={dateRange.from.toISOString().slice(0, 10)}
              onChange={e => {
                const newFrom = new Date(e.target.value);
                setDateRange({ 
                  from: newFrom, 
                  to: dateRange.to < newFrom ? newFrom : dateRange.to 
                });
              }}
              style={{ width: '100%', fontSize: 16, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0', marginTop: 4 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Data Fim</Typography>
            <input
              type="date"
              value={dateRange.to.toISOString().slice(0, 10)}
              onChange={e => {
                const newTo = new Date(e.target.value);
                setDateRange({ 
                  from: dateRange.from > newTo ? newTo : dateRange.from, 
                  to: newTo 
                });
              }}
              style={{ width: '100%', fontSize: 16, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0', marginTop: 4 }}
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Período: {dateRange.from.toLocaleDateString('pt-BR')} até {dateRange.to.toLocaleDateString('pt-BR')}
            </Typography>
          </Box>

          <Button 
            fullWidth
            variant="contained" 
            color="primary"
            onClick={() => fetchEvolution(userId)}
          >
            Buscar evolução
          </Button>
        </Box>
      </Box>
    );
  }

  function MainContent() {
    return (
      <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ mb: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Resumo Nutricional</Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
            <Button variant="outlined" color="primary" sx={{ height: 48, mr: 2 }} onClick={() => navigate(-1)}>
              Voltar
            </Button>
            {kpiData.map((kpi, index) => (
              <Box key={index} sx={{ minWidth: 230, maxWidth: 260, flex: '0 0 auto' }}>
                <KPICard {...kpi} />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ width: '100%', maxWidth: 1400, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', mt: 2 }}>
          <Box sx={{ flex: 1, minWidth: 320, maxWidth: 640, mr: 2, ml: -22 }}>
            <CalendarCard />
          </Box>
          <Box sx={{ flex: 2, minWidth: 1200, maxWidth: 1100, ml: 30, pl: 0 }}>
            <ResultChartCard />
          </Box>
        </Box>
        <Box sx={{ width: '100%', maxWidth: 1400, mt: 2 }}>
          <ConsultasBarChart />
        </Box>
      </Box>
    );
  }

  if (!userId) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#f8fff9' }}>
        <Typography variant="h6" color="text.secondary">Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)', width: '100%' }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          bgcolor: 'transparent',
          minHeight: '100vh',
          p: 2,
        }}
      >
        <MainContent />
      </Box>
    </Box>
  );
}
