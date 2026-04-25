import React, { useState } from 'react';
import { Box, Pagination, Container, CssBaseline, Card, Typography, Button, Chip, Tabs, Tab, Grid, Divider, Tooltip as MuiTooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BalanceIcon from '@mui/icons-material/Balance';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { WeightEvolutionChart } from '../components/PatientCharts';

// ---------------------------------------------------------------------------
// Classificação clínica para badges dos KPIs
// ---------------------------------------------------------------------------
function getKpiBadge(type, value) {
  if (value === '-' || value == null) return null;
  const v = Number(value);
  if (isNaN(v)) return null;

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
  return null;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [dateRange, setDateRange] = React.useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);
    return { from: sixtyDaysAgo, to: today };
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [evolution, setEvolution] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [patientMotivoConsulta, setPatientMotivoConsulta] = useState('');
  const [kpiValues, setKpiValues] = useState({ imc: '-', gordura: '-', massaMuscular: '-', gorduraVisceral: '-' });
  const [kpiTrends, setKpiTrends] = useState({ imc: null, gordura: null, massaMuscular: null, gorduraVisceral: null });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [latestMotivoConsulta, setLatestMotivoConsulta] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  let userId = location.state?.user?.id || location.state?.pacienteId;
  if (!userId) {
    const storedPatientId = sessionStorage.getItem('pacienteId') || localStorage.getItem('pacienteId');
    if (storedPatientId) userId = parseInt(storedPatientId, 10);
  }

  React.useEffect(() => {
    const name = location.state?.patientName || location.state?.user?.name
      || sessionStorage.getItem('pacienteNome') || localStorage.getItem('pacienteNome') || '';
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
    if (userId && startDate && endDate) fetchEvolution(userId);
  }, [userId, startDate, endDate, currentPage]);

  React.useEffect(() => {
    if (evolution.length > 0) {
      const sorted = [...evolution].sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta));
      const latest = sorted[sorted.length - 1];
      const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

      const calcTrend = (l, p) => {
        if (l == null || p == null) return null;
        const lv = Number(l), pv = Number(p);
        if (isNaN(lv) || isNaN(pv) || pv === 0) return null;
        return ((lv - pv) / pv * 100).toFixed(1);
      };

      setKpiValues({
        imc: latest.imc?.toFixed(1) || '-',
        gordura: latest.gordura || '-',
        massaMuscular: latest.massaMuscular || '-',
        gorduraVisceral: latest.gorduraVisceral || '-',
      });
      setKpiTrends({
        imc: calcTrend(latest.imc, previous?.imc),
        gordura: calcTrend(latest.gordura, previous?.gordura),
        massaMuscular: calcTrend(latest.massaMuscular, previous?.massaMuscular),
        gorduraVisceral: calcTrend(latest.gorduraVisceral, previous?.gorduraVisceral),
      });
      setLatestMotivoConsulta(latest.motivoConsulta || patientMotivoConsulta || '');
    } else {
      setKpiValues({ imc: '-', gordura: '-', massaMuscular: '-', gorduraVisceral: '-' });
      setKpiTrends({ imc: null, gordura: null, massaMuscular: null, gorduraVisceral: null });
      setLatestMotivoConsulta(patientMotivoConsulta || '');
    }
  }, [evolution, patientMotivoConsulta]);

  const handleDownloadBioimpedance = async () => {
    if (!userId) return;
    setPdfLoading(true);
    try {
      const res = await api.get(`/patient-history/${userId}/pdf-bioimpedancia`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-bioimpedancia-${patientName || userId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      alert('Erro ao gerar relatório de bioimpedância. Verifique se o paciente possui dados de avaliação.');
    } finally {
      setPdfLoading(false);
    }
  };

  const fetchEvolution = async (pacienteId) => {
    console.log('fetchEvolution chamado com:', pacienteId, startDate, endDate); // DEBUG
    if (!pacienteId || !startDate || !endDate) {
      alert('Informe paciente, data início e data fim.');
      return;
    }
    try {
      const res = await api.get(`/patient-history/evolucao/${pacienteId}`, {
        params: { dataInicio: startDate, dataFim: endDate, page: Math.max(currentPage - 1, 0) }
      });
      const total = Number(res.data?.totalPages) || 1;
      const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setEvolution(data);
      setTotalPages(Math.max(total, 1));
    } catch (err) {
      console.error('Erro ao buscar evolução:', err);
      alert(`Erro: ${err.message}`);
      setEvolution([]);
    }
  };

  // ---------------------------------------------------------------------------
  // KPI Card com trend + badge de classificação
  // ---------------------------------------------------------------------------
  const KPICard = ({ title, value, icon: IconComponent, colorKey = 'primary', trend, badge }) => {
    const theme = useTheme();
    const colorMain = theme.palette[colorKey]?.main || theme.palette.primary.main;
    const colorDark = theme.palette[colorKey]?.dark || colorMain;
    const trendVal = trend !== null && trend !== undefined ? parseFloat(trend) : null;
    const trendDown = trendVal !== null && trendVal < 0;

    return (
      <Card sx={{
        height: 148,
        width: '100%',
        minWidth: { xs: 0, sm: 220 },
        maxWidth: { xs: '100%', sm: 260 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 3,
        p: 2,
        borderTop: `3px solid ${colorMain}`,
        borderRadius: 2,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.13)' },
      }}>
        {/* Título + ícone */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem', color: 'text.secondary', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          {IconComponent && <IconComponent sx={{ color: colorMain, fontSize: 20, opacity: 0.8 }} />}
        </Box>

        {/* Valor principal */}
        <Typography variant="h3" fontWeight="bold" sx={{ color: colorDark, fontSize: '2rem', lineHeight: 1 }}>
          {value}
        </Typography>

        {/* Trend + badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {trendVal !== null ? (
            <Typography variant="caption" sx={{
              color: trendDown ? '#2e7d32' : '#e65100',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}>
              {trendDown ? '↓' : '↑'} {Math.abs(trendVal)}%
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>sem comparativo</Typography>
          )}
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              sx={{
                bgcolor: badge.bg,
                color: badge.color,
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 20,
                border: `1px solid ${badge.color}44`,
              }}
            />
          )}
        </Box>
      </Card>
    );
  };

  const kpiData = [
    { title: 'IMC',              value: kpiValues.imc,            icon: FactCheckIcon,     colorKey: 'primary',   trend: kpiTrends.imc,            badge: getKpiBadge('imc', kpiValues.imc) },
    { title: 'Gordura (%)',      value: kpiValues.gordura,         icon: BalanceIcon,       colorKey: 'primary',   trend: kpiTrends.gordura,         badge: getKpiBadge('gordura', kpiValues.gordura) },
    { title: 'Massa Muscular',   value: kpiValues.massaMuscular,   icon: FitnessCenterIcon, colorKey: 'secondary', trend: kpiTrends.massaMuscular,   badge: null },
    { title: 'Gordura Visceral', value: kpiValues.gorduraVisceral, icon: ManageAccountsIcon,colorKey: 'primary',   trend: kpiTrends.gorduraVisceral, badge: getKpiBadge('gorduraVisceral', kpiValues.gorduraVisceral) },
  ];

  // ---------------------------------------------------------------------------
  // Gráfico de evolução do peso (Recharts via WeightEvolutionChart)
  // ---------------------------------------------------------------------------
  const ResultChartCard = () => {
    const theme = useTheme();
    const secondary = theme.palette.secondary.main;
    const [showSelect, setShowSelect] = React.useState(false);

    const evoSorted = [...evolution].sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta));

    let pesoAtual = '-', pesoIdeal = '-';
    if (evoSorted.length) {
      const last = evoSorted[evoSorted.length - 1];
      pesoAtual = last.peso ?? '-';
      pesoIdeal = last.pesoIdeal ?? '-';
    }

    const chartData = evoSorted.map((e) => {
      const d = e.dataConsulta ? new Date(e.dataConsulta) : null;
      return {
        date: d && !isNaN(d)
          ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
          : '—',
        peso: e.peso ?? 0,
      };
    });

    if (chartData.length === 0) {
      return (
        <Card sx={{ p: 2, boxShadow: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8, mb: 2 }}>Evolução do Peso</Typography>
          <Box sx={{ width: '100%', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1, px: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nenhum dado de peso encontrado para o período selecionado.
            </Typography>
          </Box>
        </Card>
      );
    }

    return (
      <Card sx={{ p: { xs: 1.5, md: 2 }, boxShadow: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 1.5 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.85 }}>Evolução do Peso</Typography>
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
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#43a047', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 14, boxShadow: 1 }}>
                  Peso Ideal:&nbsp;{pesoIdeal} kg
                </Box>
              )}
              <Button size="small" variant="outlined" color="secondary" sx={{ ml: 1, minWidth: 0, px: 1, fontSize: 13, py: 0.2 }} onClick={() => setShowSelect(false)}>Fechar</Button>
            </Box>
          )}
        </Box>
        <WeightEvolutionChart data={chartData} pesoIdeal={pesoIdeal !== '-' ? Number(pesoIdeal) : undefined} />
      </Card>
    );
  };

  // ---------------------------------------------------------------------------
  // Histórico em abas
  // ---------------------------------------------------------------------------
  const HistoricoDadosPaciente = () => {
    const [tab, setTab] = useState(0);
const handlePageChange = (_, newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
  };
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
           <Box
                            sx={{
                              mt: 3,
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1.5,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Página {currentPage} de {totalPages}
                            </Typography>
                            <Pagination
                              color="success"
                              page={currentPage}
                              count={totalPages}
                              onChange={handlePageChange}
                              showFirstButton
                              showLastButton
                            />
                          </Box>
        </Box>
      </Box>
    );
  };

  // ---------------------------------------------------------------------------
  // Calendário / filtro de período
  // ---------------------------------------------------------------------------
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
                setDateRange({ from: newFrom, to: dateRange.to < newFrom ? newFrom : dateRange.to });
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
                setDateRange({ from: dateRange.from > newTo ? newTo : dateRange.from, to: newTo });
              }}
              style={{ width: '100%', fontSize: 16, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0', marginTop: 4 }}
            />
          </Box>
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Período: {dateRange.from.toLocaleDateString('pt-BR')} até {dateRange.to.toLocaleDateString('pt-BR')}
            </Typography>
          </Box>
          <Button fullWidth variant="contained" color="primary" onClick={() => fetchEvolution(userId)}>
            Buscar evolução
          </Button>
        </Box>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // Barra de progresso entre 1ª e última consulta
  // ---------------------------------------------------------------------------
  function ProgressSummary() {
    if (evolution.length < 2) return null;
    const sorted = [...evolution].sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const delta = (a, b, unit = '', lowerIsBetter = false) => {
      if (a == null || b == null) return null;
      const diff = (Number(b) - Number(a)).toFixed(1);
      const isGood = lowerIsBetter ? Number(diff) < 0 : Number(diff) > 0;
      const isNeutral = Number(diff) === 0;
      return { diff, unit, color: isNeutral ? '#888' : isGood ? '#2e7d32' : '#c62828', arrow: Number(diff) < 0 ? '↓' : Number(diff) > 0 ? '↑' : '=' };
    };

    const items = [
      { label: 'Peso',            d: delta(first.peso,            last.peso,            'kg', true) },
      { label: 'IMC',             d: delta(first.imc,             last.imc,             '',   true) },
      { label: 'Gordura',         d: delta(first.gordura,         last.gordura,         '%',  true) },
      { label: 'Gordura Visceral',d: delta(first.gorduraVisceral, last.gorduraVisceral, '',   true) },
      { label: 'Massa Muscular',  d: delta(first.massaMuscular,   last.massaMuscular,   '%',  false) },
    ].filter(i => i.d !== null);

    return (
      <Card sx={{ px: 3, py: 1.5, mb: 2.5, boxShadow: 1, borderRadius: 2, bgcolor: '#f8fff9', border: '1px solid #c8e6c9', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
            Progresso ({sorted.length} consultas)
          </Typography>
          <Divider orientation="vertical" flexItem />
          {items.map(({ label, d }) => (
            <MuiTooltip key={label} title="Variação desde a 1ª consulta" placement="top">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'default' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{label}:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: d.color, fontSize: '0.82rem' }}>
                  {d.arrow} {Math.abs(d.diff)}{d.unit}
                </Typography>
              </Box>
            </MuiTooltip>
          ))}
        </Box>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Layout principal
  // ---------------------------------------------------------------------------
  function MainContent() {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

          {/* Header: título + botões */}
          <Box sx={{ mb: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />} sx={{ height: 40 }} onClick={() => navigate(-1)}>
                Voltar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadBioimpedance}
                disabled={pdfLoading}
                sx={{ height: 40, whiteSpace: 'nowrap' }}
              >
                {pdfLoading ? 'Gerando...' : 'Relatório Bioimpedância'}
              </Button>
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, pt: 1, textAlign: 'center' }}>
              Resumo Nutricional {patientName && `de ${patientName}`}
            </Typography>
            {latestMotivoConsulta && (
              <Typography
                variant="body1"
                sx={{ mb: 2, px: 2, py: 1, borderRadius: 2, bgcolor: '#f1f8e9', textAlign: 'center', width: '100%', maxWidth: 900 }}
              >
                <strong>Motivo da consulta:</strong> {latestMotivoConsulta}
              </Typography>
            )}

            {/* KPIs */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
              {kpiData.map((kpi, index) => (
                <Box key={index} sx={{ width: { xs: '100%', sm: 240, md: 250 }, maxWidth: 260 }}>
                  <KPICard {...kpi} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Barra de progresso */}
          <ProgressSummary />

          {/* Calendário + Gráfico (responsivo) */}
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid item xs={12} lg={4}>
              <CalendarCard />
            </Grid>
            <Grid item xs={12} lg={8} sx={{ mt: { xs: 0, lg: 5 } }}>
              <ResultChartCard />
            </Grid>
          </Grid>

          {/* Histórico */}
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
