import React, { useState } from 'react';
import { Box, CssBaseline, Card, Typography, Button, Chip, Tabs, Tab, Divider, Tooltip as MuiTooltip } from '@mui/material';
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
  const [kpiValues, setKpiValues] = useState({ imc: '-', gordura: '-', massaMuscular: '-', gorduraVisceral: '-' });
  const [kpiTrends, setKpiTrends] = useState({ imc: null, gordura: null, massaMuscular: null, gorduraVisceral: null });
  const [pdfLoading, setPdfLoading] = useState(false);

  let userId = location.state?.user?.id || location.state?.pacienteId;
  if (!userId) {
    const storedPatientId = sessionStorage.getItem('pacienteId') || localStorage.getItem('pacienteId');
    if (storedPatientId) userId = parseInt(storedPatientId, 10);
  }

  React.useEffect(() => {
    const name = location.state?.patientName || location.state?.user?.name
      || sessionStorage.getItem('pacienteNome') || localStorage.getItem('pacienteNome') || '';
    setPatientName(name);
  }, [location.state]);

  React.useEffect(() => {
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setStartDate(fmt(dateRange.from));
    setEndDate(fmt(dateRange.to));
  }, [dateRange]);

  React.useEffect(() => {
    if (userId && startDate && endDate) fetchEvolution(userId);
  }, [userId, startDate, endDate]);

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
    } else {
      setKpiValues({ imc: '-', gordura: '-', massaMuscular: '-', gorduraVisceral: '-' });
      setKpiTrends({ imc: null, gordura: null, massaMuscular: null, gorduraVisceral: null });
    }
  }, [evolution]);

  const handleDownloadBioimpedance = async () => {
    if (!userId) return;
    setPdfLoading(true);
    try {
      const nutricionistaId = sessionStorage.getItem('idUsuario') || localStorage.getItem('idUsuario');
      if (!nutricionistaId) {
        alert('ID do nutricionista não encontrado. Faça login novamente.');
        return;
      }
      const res = await api.get(`/patient-history/${userId}/pdf-bioimpedancia`, {
        params: { nutricionistaId },
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
        params: { dataInicio: startDate, dataFim: endDate }
      });
      setEvolution(Array.isArray(res.data) ? res.data : []);
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
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
    { title: 'IMC',             value: kpiValues.imc,           icon: FactCheckIcon,     colorKey: 'primary',   trend: kpiTrends.imc,           badge: getKpiBadge('imc', kpiValues.imc) },
    { title: 'Gordura (%)',     value: kpiValues.gordura,        icon: BalanceIcon,       colorKey: 'primary',   trend: kpiTrends.gordura,        badge: getKpiBadge('gordura', kpiValues.gordura) },
    { title: 'Massa Muscular',  value: kpiValues.massaMuscular,  icon: FitnessCenterIcon, colorKey: 'secondary', trend: kpiTrends.massaMuscular,  badge: null },
    { title: 'Gordura Visceral',value: kpiValues.gorduraVisceral,icon: ManageAccountsIcon,colorKey: 'primary',   trend: kpiTrends.gorduraVisceral,badge: getKpiBadge('gorduraVisceral', kpiValues.gorduraVisceral) },
  ];

  // ---------------------------------------------------------------------------
  // Gráfico de evolução do peso usando WeightEvolutionChart (Recharts)
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
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Nenhum dado de peso encontrado para o período selecionado.
          </Typography>
        </Card>
      );
    }

    return (
      <Card sx={{ p: 2.5, boxShadow: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.85 }}>Evolução do Peso</Typography>
          {!showSelect ? (
            <Chip
              icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
              label="Ver metas"
              onClick={() => setShowSelect(true)}
              sx={{ bgcolor: secondary, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            />
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#ff9800', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 13 }}>
                Atual:&nbsp;{pesoAtual} kg
              </Box>
              {pesoIdeal !== '-' && (
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#43a047', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 13 }}>
                  Ideal:&nbsp;{pesoIdeal} kg
                </Box>
              )}
              <Button size="small" variant="outlined" color="secondary" sx={{ minWidth: 0, px: 1, fontSize: 12, py: 0.2 }} onClick={() => setShowSelect(false)}>
                Fechar
              </Button>
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
    const sorted = [...evolution].sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta));

    return (
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={1.5}>Histórico de dados do paciente</Typography>
        <Box sx={{ bgcolor: '#f8fff9', borderRadius: 2, boxShadow: 1, p: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 1.5, '& .MuiTab-root': { fontWeight: 'bold', fontSize: '0.8rem', minWidth: 100 } }}
          >
            {sorted.map((_, idx) => (
              <Tab key={idx} label={`Consulta ${idx + 1}`} />
            ))}
          </Tabs>
          <Box>
            {sorted[tab] ? <DataTable data={sorted[tab]} /> : <Typography color="text.secondary">Sem dados</Typography>}
          </Box>
        </Box>
      </Box>
    );
  };

  // ---------------------------------------------------------------------------
  // Calendário / filtro de período
  // ---------------------------------------------------------------------------
  function CalendarCard() {
    const fmtInput = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return (
      <Card sx={{ p: 2.5, borderRadius: 2, boxShadow: 2, bgcolor: '#f8fff9', height: '100%' }}>
        <Typography variant="subtitle2" fontWeight="bold" mb={1.5} color="primary.dark">
          Filtrar período
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Data Início</Typography>
          <input
            type="date"
            value={fmtInput(dateRange.from)}
            onChange={e => {
              const newFrom = new Date(e.target.value);
              setDateRange({ from: newFrom, to: dateRange.to < newFrom ? newFrom : dateRange.to });
            }}
            style={{ width: '100%', fontSize: 14, padding: '6px 10px', borderRadius: 8, border: '1px solid #c8e6c9', marginTop: 4, boxSizing: 'border-box' }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">Data Fim</Typography>
          <input
            type="date"
            value={fmtInput(dateRange.to)}
            onChange={e => {
              const newTo = new Date(e.target.value);
              setDateRange({ from: dateRange.from > newTo ? newTo : dateRange.from, to: newTo });
            }}
            style={{ width: '100%', fontSize: 14, padding: '6px 10px', borderRadius: 8, border: '1px solid #c8e6c9', marginTop: 4, boxSizing: 'border-box' }}
          />
        </Box>
        <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1.5, mb: 2 }}>
          <Typography variant="caption" fontWeight="bold" color="primary.dark">
            {dateRange.from.toLocaleDateString('pt-BR')} → {dateRange.to.toLocaleDateString('pt-BR')}
          </Typography>
        </Box>
        <Button fullWidth variant="contained" color="primary" onClick={() => fetchEvolution(userId)}>
          Buscar evolução
        </Button>
      </Card>
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
      { label: 'Peso', d: delta(first.peso, last.peso, 'kg', true) },
      { label: 'IMC', d: delta(first.imc, last.imc, '', true) },
      { label: 'Gordura', d: delta(first.gordura, last.gordura, '%', true) },
      { label: 'Gordura Visceral', d: delta(first.gorduraVisceral, last.gorduraVisceral, '', true) },
      { label: 'Massa Muscular', d: delta(first.massaMuscular, last.massaMuscular, '%', false) },
    ].filter(i => i.d !== null);

    return (
      <Card sx={{ px: 3, py: 1.5, mb: 2.5, boxShadow: 1, borderRadius: 2, bgcolor: '#f8fff9', border: '1px solid #c8e6c9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
            Progresso ({sorted.length} consultas)
          </Typography>
          <Divider orientation="vertical" flexItem />
          {items.map(({ label, d }) => (
            <MuiTooltip key={label} title={`Variação desde a 1ª consulta`} placement="top">
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
      <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1440, mx: 'auto', width: '100%' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />} sx={{ height: 38 }} onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" lineHeight={1.2}>
              {patientName || 'Paciente'}
            </Typography>
            <Typography variant="caption" color="text.secondary">Resumo Nutricional • {evolution.length} consulta{evolution.length !== 1 ? 's' : ''} no período</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadBioimpedance}
            disabled={pdfLoading}
            sx={{ height: 38, whiteSpace: 'nowrap' }}
          >
            {pdfLoading ? 'Gerando...' : 'Relatório Bioimpedância'}
          </Button>
        </Box>

        {/* KPI Grid — 4 colunas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </Box>

        {/* Barra de progresso */}
        <ProgressSummary />

        {/* Filtro + Gráfico — 2 colunas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 2.5, mb: 3, alignItems: 'start' }}>
          <CalendarCard />
          <ResultChartCard />
        </Box>

        {/* Tabela histórico */}
        <HistoricoDadosPaciente />
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
      <Box component="main" sx={{ flexGrow: 1, width: '100%', minHeight: '100vh' }}>
        <MainContent />
      </Box>
    </Box>
  );
}
