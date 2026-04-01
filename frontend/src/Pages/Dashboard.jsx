import React, { useState } from 'react';
import { Box, Container, CssBaseline, Card, Typography, Button, Chip, Tabs, Tab, Grid } from '@mui/material';
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
  const [patientMotivoConsulta, setPatientMotivoConsulta] = useState('');
  const [kpiValues, setKpiValues] = useState({
    imc: '-',
    gordura: '-',
    massaMuscular: '-',
    gorduraVisceral: '-',
  });
  const [latestMotivoConsulta, setLatestMotivoConsulta] = useState('');


  let userId = location.state?.user?.id || location.state?.pacienteId;
  if (!userId) {
    const storedPatientId = sessionStorage.getItem('pacienteId') || localStorage.getItem('pacienteId');
    if (storedPatientId) userId = parseInt(storedPatientId, 10);
  }

  React.useEffect(() => {
    const name = location.state?.patientName || location.state?.user?.name || sessionStorage.getItem('pacienteNome') || localStorage.getItem('pacienteNome') || '';
    setPatientName(name);
    const motivo = location.state?.user?.motivoConsulta || '';
    if (motivo) setPatientMotivoConsulta(motivo);
  }, [location.state]);

  React.useEffect(() => {
    const fetchPatientMotivo = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/patients/${userId}`);
        setPatientMotivoConsulta(res.data?.motivoConsulta || '');
      } catch (error) {
        console.error('Erro ao buscar motivo da consulta do paciente:', error);
      }
    };
    fetchPatientMotivo();
  }, [userId]);


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
      const resolvedMotivo = latestEvolution.motivoConsulta || patientMotivoConsulta || '';
      setKpiValues({
        imc: latestEvolution.imc?.toFixed(1) || '-',
        gordura: latestEvolution.gordura || '-',
        massaMuscular: latestEvolution.massaMuscular || '-',
        gorduraVisceral: latestEvolution.gorduraVisceral || '-',
      });
      setLatestMotivoConsulta(resolvedMotivo);
    } else {
      setKpiValues({
        imc: '-',
        gordura: '-',
        massaMuscular: '-',
        gorduraVisceral: '-',
      });
      setLatestMotivoConsulta(patientMotivoConsulta || '');
    }
  }, [evolution, patientMotivoConsulta]);

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
      <Card
        sx={{
          height: 110,
          width: '100%',
          minWidth: { xs: 0, sm: 220 },
          maxWidth: { xs: '100%', sm: 260 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: 3,
          p: 2
        }}
      >
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
        <Card sx={{ p: 2, boxShadow: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8, mb: 2 }}>Evolução do Peso</Typography>
          <Box sx={{ width: '100%', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1, px: 2 }}>
            <Typography variant="body2" color="text.secondary">Nenhum dado de peso encontrado para o período selecionado. Selecione um intervalo com consultas registradas.</Typography>
          </Box>
        </Card>
      );
    }
    return (
      <Card sx={{ p: { xs: 1.5, md: 2 }, boxShadow: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8 }}>Evolução do Peso</Typography>
          {!showSelect ? (
            <Chip
              icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
              label="Ver metas"
              onClick={() => setShowSelect(true)}
              sx={{ bgcolor: secondary, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            />
          ) : (
            <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
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
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Box
            sx={{
              width: '100%',
              minHeight: { xs: 240, sm: 280 },
              aspectRatio: '1100 / 350',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #eee', display: 'block', overflow: 'hidden' }}
          >
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

        <Box sx={{ bgcolor: '#f8fff9', borderRadius: 2, boxShadow: 1, p: 2, width: '100%' }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {evolution.map((_, idx) => (
              <Tab key={idx} label={`Consulta ${idx + 1}`} sx={{ fontWeight: 'bold' }} />
            ))}
          </Tabs>

          <Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
            {evolution[tab]
              ? <DataTable data={{ ...evolution[tab], motivoConsulta: evolution[tab]?.motivoConsulta || patientMotivoConsulta || '' }} />
              : <Typography>Sem dados</Typography>}
          </Box>
        </Box>
      </Box>
    );
  };

  function CalendarCard() {
    return (
      <Box sx={{ width: '100%' }}>
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
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Box sx={{ mb: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, padding: 3, textAlign: 'center' }}>Resumo Nutricional {patientName && `de ${patientName}`}</Typography>
            {latestMotivoConsulta && (
              <Typography
                variant="body1"
                sx={{ mb: 2, px: 2, py: 1, borderRadius: 2, bgcolor: '#f1f8e9', textAlign: 'center', width: '100%', maxWidth: 900 }}
              >
                <strong>Motivo da consulta:</strong> {latestMotivoConsulta}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
              <Button variant="outlined" color="primary" sx={{ height: 48 }} onClick={() => navigate(-1)}>
                Voltar
              </Button>
              {kpiData.map((kpi, index) => (
                <Box key={index} sx={{ width: { xs: '100%', sm: 240, md: 250 }, maxWidth: 260 }}>
                  <KPICard {...kpi} />
                </Box>
              ))}
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mt: 1, width: '100%' }}>
            <Grid item xs={12} lg={4}>
              <CalendarCard />
            </Grid>
            <Grid item xs={12} lg={8} sx={{ mt: { xs: 0, lg: 5 } }}>
              <ResultChartCard />
            </Grid>
          </Grid>

          <Box sx={{ width: '100%', mt: 2 }}>
            <HistoricoDadosPaciente />
          </Box>
        </Box>
      </Container>
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
