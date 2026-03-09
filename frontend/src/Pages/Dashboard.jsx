import React, { useState } from 'react';
import { Box, CssBaseline, Card, Typography, Button, Chip, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BalanceIcon from '@mui/icons-material/Balance';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import DataTable from '../components/DataTable';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [dateRange, setDateRange] = React.useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); 
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);
    return {
      from: sixtyDaysAgo,
      to: today,
    };
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [evolution, setEvolution] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [kpiValues, setKpiValues] = useState({
    imc: '-',
    gordura: '-',
    massaMuscular: '-',
    gorduraVisceral: '-',
  });


  let userId = location.state?.user?.id || location.state?.pacienteId;
  if (!userId) {
    const storedPatientId = sessionStorage.getItem('pacienteId') || localStorage.getItem('pacienteId');
    if (storedPatientId) userId = parseInt(storedPatientId, 10);
  }

  React.useEffect(() => {
    const name = location.state?.patientName || location.state?.user?.name || sessionStorage.getItem('pacienteNome') || localStorage.getItem('pacienteNome') || '';
    setPatientName(name);
  }, [location.state]);


  React.useEffect(() => {
    const fromYear = dateRange.from.getFullYear();
    const fromMonth = String(dateRange.from.getMonth() + 1).padStart(2, '0');
    const fromDay = String(dateRange.from.getDate()).padStart(2, '0');
    setStartDate(`${fromYear}-${fromMonth}-${fromDay}`);

    const toYear = dateRange.to.getFullYear();
    const toMonth = String(dateRange.to.getMonth() + 1).padStart(2, '0');
    const toDay = String(dateRange.to.getDate()).padStart(2, '0');
    setEndDate(`${toYear}-${toMonth}-${toDay}`);
  }, [dateRange]);

  React.useEffect(() => {
    if (userId && startDate && endDate) {
      fetchEvolution(userId);
    }
  }, [userId, startDate, endDate]);

  React.useEffect(() => {
    if (evolution.length > 0) {
      // Ordena por data descrescente para pegar a mais recente
      const sorted = [...evolution].sort((a, b) => new Date(b.dataConsulta) - new Date(a.dataConsulta));
      const latestEvolution = sorted[0]; // Primeira é a mais recente
      setKpiValues({
        imc: latestEvolution.imc?.toFixed(1) || '-',
        gordura: latestEvolution.gordura || '-',
        massaMuscular: latestEvolution.massaMuscular || '-',
        gorduraVisceral: latestEvolution.gorduraVisceral || '-',
      });
    } else {
      setKpiValues({
        imc: '-',
        gordura: '-',
        massaMuscular: '-',
        gorduraVisceral: '-',
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
    
      const res = await api.get(`/patient-history/evolucao/${pacienteId}`, {
        params: { dataInicio: startDate, dataFim: endDate }
      });
    
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
  ];

  const ResultChartCard = () => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const [showSelect, setShowSelect] = React.useState(false);

    const evoSorted = [...evolution].sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta));
    let pesoAtual = '-';
    let pesoIdeal = '-';
    if (evoSorted.length) {
      const last = evoSorted[evoSorted.length - 1];
      pesoAtual = last.peso ?? '-';
      pesoIdeal = last.pesoIdeal ?? '-';
    }
    const pesoData = evoSorted.length > 0 ? evoSorted.map(e => e.peso ?? 0) : [];
    let evoLabels = evoSorted.length ? evoSorted.map((e, idx) => `${idx+1}° consulta`) : [];
    let evoDates = evoSorted.length ? evoSorted.map(e => {
      const data = e.dataConsulta ? new Date(e.dataConsulta) : null;
      return data && !isNaN(data) ? `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth()+1).padStart(2, '0')}` : '';
    }) : [];
    
    const width = 1100;
    const height = 350;
    const padding = 50;
    const rightPadding = 100;
    const numPesoData = pesoData.map(v => Number(v)).filter(v => !isNaN(v));
    const minPeso = numPesoData.length > 0 ? Math.min(...numPesoData) - 1 : 0;
    const maxPeso = numPesoData.length > 0 ? Math.max(...numPesoData) + 1 : 100;
    const getY = (peso) => maxPeso === minPeso ? height / 2 : padding + ((maxPeso - peso) / (maxPeso - minPeso)) * (height - padding * 2);
    const getX = (i) => pesoData.length > 1 ? padding + i * ((width - padding - rightPadding) / (pesoData.length - 1)) : width / 2;
    const points = pesoData.length > 0 ? pesoData.map((peso, i) => `${getX(i)},${getY(Number(peso))}`).join(' ') : '';
    
    if (pesoData.length === 0) {
      return (
        <Card sx={{ p: 2, boxShadow: 3, mb: 2}}>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8, mb: 2 }}>Evolução do Peso</Typography>
          <Box sx={{ width: width, height: height + 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Nenhum dado de peso encontrado para o período selecionado. Selecione um intervalo com consultas registradas.</Typography>
          </Box>
        </Card>
      );
    }
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
              {pesoIdeal !== '-' && (
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#4caf50', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 14, boxShadow: 1 }}>
                  Peso Ideal:&nbsp;{pesoIdeal} kg
                </Box>
              )}
              <Button size="small" variant="outlined" color="secondary" sx={{ ml: 1, minWidth: 0, px: 1, fontSize: 13, py: 0.2 }} onClick={() => setShowSelect(false)}>Fechar</Button>
            </Box>
          )}
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
  };

  const HistoricoDadosPaciente = () => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);

    return (
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>
        Histórico de dados do paciente
        </Typography>

        <Box sx={{ bgcolor: '#f8fff9', borderRadius: 2, boxShadow: 1, p: 2, maxWidth: 1100 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            {evolution.map((_, idx) => (
              <Tab key={idx} label={`Consulta ${idx + 1}`} sx={{ fontWeight: 'bold' }} />
            ))}
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {evolution[tab] ? <DataTable data={evolution[tab]} /> : <Typography>Sem dados</Typography>}
          </Box>
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
              value={`${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth() + 1).padStart(2, '0')}-${String(dateRange.from.getDate()).padStart(2, '0')}`}
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
              value={`${dateRange.to.getFullYear()}-${String(dateRange.to.getMonth() + 1).padStart(2, '0')}-${String(dateRange.to.getDate()).padStart(2, '0')}`}
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
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Resumo Nutricional {patientName && `de ${patientName}`}</Typography>
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
        <Box sx={{ width: '100%', ml: 10, mt: 2 }}>
          <HistoricoDadosPaciente />
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
