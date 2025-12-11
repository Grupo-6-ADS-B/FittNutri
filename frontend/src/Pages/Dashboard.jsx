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

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [dateRange, setDateRange] = React.useState({
    from: new Date(2025, 11, 11),
    to: new Date(2025, 11, 12),
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [evolution, setEvolution] = useState([]);
  const [kpiValues, setKpiValues] = useState({
    imc: '-',
    gordura: '-',
    massaMuscular: '-',
    gorduraVisceral: '-',
    idadeMetabolica: '-',
  });

  // Recupera userId
  let userId = location.state?.user?.id || location.state?.pacienteId;
  if (!userId) {
    userId = sessionStorage.getItem('idUsuario') || localStorage.getItem('idUsuario');
    if (userId) userId = parseInt(userId, 10);
  }

  // Sincroniza datas
  React.useEffect(() => {
    setStartDate(dateRange.from.toISOString().slice(0, 10));
    setEndDate(dateRange.to.toISOString().slice(0, 10));
  }, [dateRange]);

  // Atualiza KPIs quando evolution muda
  React.useEffect(() => {
    if (evolution.length > 0) {
      const lastEvolution = evolution[evolution.length - 1];
      setKpiValues({
        imc: lastEvolution.imc?.toFixed(1) || '-',
        gordura: lastEvolution.gordura || '-',
        massaMuscular: lastEvolution.massaMuscular || '-',
        gorduraVisceral: lastEvolution.gorduraVisceral || '-',
        idadeMetabolica: lastEvolution.idadeMetabolica || '-',
      });
    }
  }, [evolution]);

  const fetchEvolution = async (pacienteId) => {
    console.log('fetchEvolution chamado com:', pacienteId, startDate, endDate); // DEBUG
    
    if (!pacienteId || !startDate || !endDate) {
      alert('Informe paciente, data início e data fim.');
      return;
    }
    try {
      console.log(`Requisição: /patient-history/evolucao/${pacienteId}?dataInicio=${startDate}&dataFim=${endDate}`); // DEBUG
    
      const res = await api.get(`/patient-history/evolucao/${pacienteId}`, {
        params: { dataInicio: startDate, dataFim: endDate }
      });
    
      console.log('Resposta recebida:', res.data); // DEBUG
      setEvolution(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao buscar evolução:', err);
      alert(`Erro: ${err.message}`);
      setEvolution([]);
    }
  };

  const KPICard = ({ title, value, icon: IconComponent, colorKey = 'primary' }) => {
    const theme = useTheme();
    const colorMain = theme.palette[colorKey]?.main || theme.palette.primary.main;
    const colorDark = theme.palette[colorKey]?.dark || colorMain;
    const accent = theme.palette.secondary?.main || theme.palette.secondary;

    return (
      <Card sx={{ height: 110, minWidth: 230, maxWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 3, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'center', fontSize: '1.3rem', mb: 1 }}>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography variant="h3" fontWeight="bold" sx={{ textAlign: 'center', color: colorDark }}>{value}</Typography>
            {IconComponent && React.createElement(IconComponent, { sx: { color: accent, fontSize: 32, ml: 1 } })}
          </Box>
        </Box>
      </Card>
    );
  };

  const kpiData = [
    { title: 'IMC', value: kpiValues.imc, icon: FactCheckIcon, colorKey: 'primary' },
    { title: 'Gordura (%)', value: kpiValues.gordura, icon: BalanceIcon, colorKey: 'primary' },
    { title: 'Massa Muscular', value: kpiValues.massaMuscular, icon: FitnessCenterIcon, colorKey: 'secondary' },
    { title: 'Gordura Visceral', value: kpiValues.gorduraVisceral, icon: ManageAccountsIcon, colorKey: 'primary' },
    { title: 'Taxa Metabolica Basal', value: '-', icon: ContentPasteSearchIcon, colorKey: 'secondary' },
    { title: 'Idade Metabólica', value: kpiValues.idadeMetabolica, icon: PsychologyIcon, colorKey: 'primary' },
  ];

  const ResultChartCard = () => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    const evoSorted = [...evolution].sort((a, b) =>
      new Date(a.dataConsulta) - new Date(b.dataConsulta)
    );

    const pesoData = evoSorted.length
      ? evoSorted.map(e => e.peso)
      : [78, 77.5, 77, 76.5, 76, 75.5, 75, 74.5, 74];

    const semanas = evoSorted.length
      ? evoSorted.map(e => {
          const d = new Date(e.dataConsulta);
          return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        })
      : ['S1','S2','S3','S4','S5','S6','S7','S8','S9'];

    const width = 1000;
    const height = 250;
    const padding = 50;
    const rightPadding = 100;
    const minPeso = Math.min(...pesoData) - 1;
    const maxPeso = Math.max(...pesoData) + 1;

    const getY = (peso) => padding + ((maxPeso - peso) / (maxPeso - minPeso)) * (height - padding * 2);
    const getX = (i) => padding + i * ((width - padding - rightPadding) / (pesoData.length - 1));
    const points = pesoData.map((peso, i) => `${getX(i)},${getY(peso)}`).join(' ');

    const [showSelect, setShowSelect] = React.useState(false);
    const pesoAtual = evoSorted.length ? evoSorted[evoSorted.length - 1].peso : pesoData[pesoData.length - 1];
    const pesoIdeal = evoSorted.length ? evoSorted[evoSorted.length - 1].pesoIdeal ?? pesoAtual : 72;

    return (
      <Card sx={{ p: 2, boxShadow: 3, mb: 2 }}>
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
            {[79,78,77,76,75,74,73].map((val, idx) => (
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
              <circle key={i} cx={getX(i)} cy={getY(peso)} r={6} fill={secondary} />
            ))}
            {/* Semanas (Eixo X) */}
            {semanas.map((semana, i) => (
              <text key={semana} x={getX(i)} y={height-10} fontSize="14" textAnchor="middle" fill="#888">{semana}</text>
            ))}
          </svg>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
          <Typography variant="caption" color="text.secondary">2024</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">2025</Typography>
        </Box>
      </Card>
    );
  };

  const DonutChartCard = () => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    const legendData = [
      { label: 'Carboidratos', value: 40, color: secondary },
      { label: 'Proteínas', value: 35, color: primary },
      { label: 'Gorduras', value: 25, color: '#FFD700' },
    ];

    return (
      <Card sx={{ p: 2, boxShadow: 3, height: 388, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8 }}>Distribuição de Macronutrientes</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
          <Box sx={{ width: 170, height: 160, position: 'relative', my: 2 }}>
            <Box sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `conic-gradient(${secondary} 0deg, ${secondary} 120deg, ${primary} 120deg, ${primary} 240deg, #FFD700 240deg, #FFD700 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'white'
            }} />
            <Typography variant="h4" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: primary }}>100%</Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            {legendData.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 1, gap: 1.5 }}>
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: item.color, mr: 1, border: '2px solid #eee' }} />
                <Typography variant="body2" sx={{ minWidth: 90 }}>{item.label}</Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">{item.value}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
    );
  };

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
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">Resumo Nutricional</Typography>
          <MenuIcon sx={{ fontSize: 30, color: 'text.secondary' }} />
        </Box>
        <Box sx={{ mb: 2, overflowX: 'auto', whiteSpace: 'nowrap', pb: 1 }}>
          <Box sx={{ display: 'inline-flex', gap: 2 }}>
            {kpiData.map((kpi, index) => (
              <Box key={index} sx={{ minWidth: 230, maxWidth: 260, flex: '0 0 auto' }}>
                <KPICard {...kpi} />
              </Box>
            ))}
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <ResultChartCard />

            <Card sx={{ p: 3, mt: 2, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', boxShadow: 3 }}>
              <Box sx={{ width: 540, pr: 4 }}>
                <CalendarCard />
                <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
                  Voltar
                </Button>
              </Box>
              <Box sx={{ width: 900, pl: 10 }}>
                <ConsultasBarChart />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <DonutChartCard />
          </Grid>
        </Grid>
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
