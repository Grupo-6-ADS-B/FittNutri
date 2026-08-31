import React, { useState, useMemo } from 'react';
import {
  Box, Pagination, Container, CssBaseline, Card, Typography, Button, Chip,
  Grid, Divider, Tooltip as MuiTooltip, Avatar, IconButton, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BalanceIcon from '@mui/icons-material/Balance';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TimelineIcon from '@mui/icons-material/Timeline';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { WeightEvolutionChart, MiniSparkline } from '../components/PatientCharts';

// ---------------------------------------------------------------------------
// Tokens de design (locais)
// ---------------------------------------------------------------------------
const T = {
  shadow: {
    soft: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
    elev: '0 4px 12px rgba(46,125,50,0.08), 0 2px 4px rgba(16,24,40,0.04)',
    float: '0 12px 32px rgba(46,125,50,0.10), 0 4px 8px rgba(16,24,40,0.04)',
  },
  radius: { sm: 1.5, md: 2, lg: 3, xl: 4 },
  border: {
    subtle: '1px solid rgba(46,125,50,0.08)',
    glass: '1px solid rgba(255,255,255,0.6)',
  },
  glass: { bg: 'rgba(255,255,255,0.65)', blur: 'blur(12px)' },
  motion: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  color: {
    primary: '#2e7d32', primaryLight: '#43a047',
    accent: '#ff9800', accentText: '#e65100',
    info: '#1565c0', danger: '#c62828',
  },
};

const dateInputStyles = `
  .fn-date-input {
    width: 100%;
    font-size: 14px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1.5px solid rgba(46, 125, 50, 0.15);
    font-family: inherit;
    color: #1b1f1c;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .fn-date-input:hover { border-color: rgba(46, 125, 50, 0.4); }
  .fn-date-input:focus {
    border-color: #2e7d32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
    outline: none;
  }
`;

// ---------------------------------------------------------------------------
// Classificação clínica
// ---------------------------------------------------------------------------
function getKpiBadge(type, value) {
  if (value === '-' || value == null) return null;
  const v = Number(value);
  if (isNaN(v)) return null;
  if (type === 'imc') {
    if (v < 18.5) return { label: 'Abaixo do peso', color: '#1565c0', bg: '#e3f2fd' };
    if (v < 25)   return { label: 'Normal',          color: '#2e7d32', bg: '#e8f5e9' };
    if (v < 30)   return { label: 'Sobrepeso',       color: '#e65100', bg: '#fff3e0' };
    return               { label: 'Obeso',           color: '#c62828', bg: '#ffebee' };
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

const getInitials = (name) => {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [dateRange, setDateRange] = React.useState(() => {
    const today = new Date();
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
  const [activeQuickRange, setActiveQuickRange] = useState(60);

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
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    setStartDate(fmt(dateRange.from));
    setEndDate(fmt(dateRange.to));
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
      const res = await api.get(`/patient-history/${userId}/pdf-bioimpedancia`, { responseType: 'blob' });
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

  const applyQuickRange = (days) => {
    const today = new Date();
    const past = new Date(today); past.setDate(today.getDate() - days);
    setDateRange({ from: past, to: today });
    setActiveQuickRange(days);
  };

  // -------------------------------------------------------------------------
  // Dados derivados
  // -------------------------------------------------------------------------
  const evoSorted = useMemo(
    () => [...evolution].sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta)),
    [evolution]
  );

  const sparkSeries = useMemo(() => {
    const last5 = evoSorted.slice(-5);
    return {
      imc: last5.map(e => e.imc).filter(v => v != null),
      gordura: last5.map(e => e.gordura).filter(v => v != null),
      massaMuscular: last5.map(e => e.massaMuscular).filter(v => v != null),
      gorduraVisceral: last5.map(e => e.gorduraVisceral).filter(v => v != null),
    };
  }, [evoSorted]);

  const lastConsultDate = evoSorted.length ? new Date(evoSorted[evoSorted.length - 1].dataConsulta) : null;
  const nextSuggestedDate = lastConsultDate ? new Date(lastConsultDate.getTime() + 14 * 24 * 60 * 60 * 1000) : null;

  // -------------------------------------------------------------------------
  // TopBar (sticky)
  // -------------------------------------------------------------------------
  const TopBar = () => (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(10px)',
        bgcolor: 'rgba(248,255,249,0.85)',
        borderBottom: '1px solid rgba(46,125,50,0.06)',
        px: { xs: 2, md: 3 },
        py: 1.25,
        mx: { xs: -2, md: -3 },
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              bgcolor: '#fff',
              border: T.border.subtle,
              boxShadow: T.shadow.soft,
              '&:hover': { bgcolor: 'rgba(46,125,50,0.06)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18, color: T.color.primary }} />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600, display: 'block', lineHeight: 1 }}>
              Pacientes &nbsp;›&nbsp; {patientName || '—'}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1b5e20', lineHeight: 1.3 }}>
              Resumo Nutricional
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadBioimpedance}
          disabled={pdfLoading}
          sx={{
            height: 38,
            whiteSpace: 'nowrap',
            borderRadius: T.radius.md,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            px: 2,
            '&:hover': { boxShadow: T.shadow.elev },
          }}
        >
          {pdfLoading ? 'Gerando…' : 'Bioimpedância'}
        </Button>
      </Box>
    </Box>
  );

  // -------------------------------------------------------------------------
  // HeroPatientCard (glass)
  // -------------------------------------------------------------------------
  const HeroPatientCard = () => (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 3,
        borderRadius: T.radius.xl,
        bgcolor: T.glass.bg,
        backdropFilter: T.glass.blur,
        border: T.border.glass,
        boxShadow: '0 8px 24px rgba(46,125,50,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -60, right: -60,
          width: 220, height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(67,160,71,0.18) 0%, rgba(67,160,71,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, gap: { xs: 2, md: 3 }, flexDirection: { xs: 'column', md: 'row' }, position: 'relative' }}>
        <Avatar
          sx={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '-0.5px',
            boxShadow: '0 6px 16px rgba(46,125,50,0.25)',
          }}
        >
          {getInitials(patientName)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 0.75 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.7rem' }, letterSpacing: '-0.5px', color: '#1b5e20', lineHeight: 1.15 }}>
              {patientName || 'Paciente'}
            </Typography>
            <Chip
              label="Em acompanhamento"
              size="small"
              sx={{
                height: 22,
                bgcolor: 'rgba(46,125,50,0.1)',
                color: '#2e7d32',
                fontWeight: 700,
                fontSize: '0.7rem',
                borderRadius: 1.25,
                border: 'none',
              }}
            />
          </Box>
          {latestMotivoConsulta && (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.88rem', mb: 1, lineHeight: 1.45 }}>
              <Box component="span" sx={{ fontWeight: 700, color: '#2e7d32' }}>Motivo:</Box>{' '}
              {latestMotivoConsulta}
            </Typography>
          )}
          <Stack direction="row" spacing={2.5} divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(46,125,50,0.15)' }} />} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <HistoryIcon sx={{ fontSize: 16, color: T.color.primary }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                <Box component="span" sx={{ fontWeight: 700, color: '#1b5e20' }}>{evolution.length}</Box> consulta{evolution.length === 1 ? '' : 's'}
              </Typography>
            </Box>
            {lastConsultDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <EventNoteIcon sx={{ fontSize: 16, color: T.color.primary }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                  Última: <Box component="span" sx={{ fontWeight: 700, color: '#1b5e20' }}>{lastConsultDate.toLocaleDateString('pt-BR')}</Box>
                </Typography>
              </Box>
            )}
            {nextSuggestedDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <EventAvailableIcon sx={{ fontSize: 16, color: '#e65100' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                  Próx. sugerida: <Box component="span" sx={{ fontWeight: 700, color: '#e65100' }}>{nextSuggestedDate.toLocaleDateString('pt-BR')}</Box>
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </Card>
  );

  // -------------------------------------------------------------------------
  // MetricSegment + MetricStrip
  // -------------------------------------------------------------------------
  const MetricSegment = ({ title, value, unit, icon: Icon, color, trend, badge, spark, isLast }) => {
    const trendVal = trend !== null && trend !== undefined ? parseFloat(trend) : null;
    const trendDown = trendVal !== null && trendVal < 0;
    return (
      <Box
        sx={{
          flex: 1,
          minWidth: { xs: 220, md: 0 },
          px: { xs: 2.25, md: 2.5 },
          py: 2.5,
          borderRight: { xs: 'none', md: isLast ? 'none' : T.border.subtle },
          borderBottom: { xs: isLast ? 'none' : T.border.subtle, md: 'none' },
          position: 'relative',
          transition: T.motion,
          '&:hover': { bgcolor: 'rgba(46,125,50,0.025)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25 }}>
          <Typography variant="caption" sx={{
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: '0.65rem',
            color: 'text.secondary',
            letterSpacing: 0.7,
          }}>
            {title}
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28, height: 28,
            borderRadius: '50%',
            bgcolor: `${color}14`,
          }}>
            <Icon sx={{ color, fontSize: 16 }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
          <Typography sx={{
            color: '#1b5e20',
            fontSize: '2.1rem',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.6px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {value}
          </Typography>
          {unit && value !== '-' && (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600 }}>{unit}</Typography>
          )}
        </Box>

        {/* Sparkline */}
        <Box sx={{ mt: 1, mb: 1, opacity: 0.85 }}>
          <MiniSparkline data={spark} color={color} height={24} />
        </Box>

        {/* Trend + badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, minHeight: 22 }}>
          {trendVal !== null ? (
            <Typography variant="caption" sx={{
              color: trendDown ? '#2e7d32' : '#e65100',
              fontWeight: 700,
              fontSize: '0.75rem',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {trendDown ? '↓' : '↑'} {Math.abs(trendVal)}%
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>—</Typography>
          )}
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              sx={{
                bgcolor: badge.bg,
                color: badge.color,
                fontWeight: 700,
                fontSize: '0.62rem',
                height: 18,
                borderRadius: 1,
                border: 'none',
                '& .MuiChip-label': { px: 0.85 },
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  const MetricStrip = () => {
    const segments = [
      { title: 'IMC',              value: kpiValues.imc,            unit: '',  icon: FactCheckIcon,     color: T.color.primary,      trend: kpiTrends.imc,            badge: getKpiBadge('imc', kpiValues.imc),                       spark: sparkSeries.imc },
      { title: 'Gordura',          value: kpiValues.gordura,        unit: '%', icon: BalanceIcon,       color: T.color.primaryLight, trend: kpiTrends.gordura,        badge: getKpiBadge('gordura', kpiValues.gordura),               spark: sparkSeries.gordura },
      { title: 'Massa Muscular',   value: kpiValues.massaMuscular,  unit: '%', icon: FitnessCenterIcon, color: T.color.primary,      trend: kpiTrends.massaMuscular,  badge: getKpiBadge('massaMuscular', kpiValues.massaMuscular),   spark: sparkSeries.massaMuscular },
      { title: 'Gordura Visceral', value: kpiValues.gorduraVisceral,unit: '',  icon: ManageAccountsIcon,color: T.color.accent,       trend: kpiTrends.gorduraVisceral,badge: getKpiBadge('gorduraVisceral', kpiValues.gorduraVisceral),spark: sparkSeries.gorduraVisceral },
    ];
    return (
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: T.radius.lg,
          bgcolor: '#fff',
          border: T.border.subtle,
          boxShadow: T.shadow.soft,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {segments.map((s, i) => (
            <MetricSegment key={s.title} {...s} isLast={i === segments.length - 1} />
          ))}
        </Box>
      </Card>
    );
  };

  // -------------------------------------------------------------------------
  // ProgressTrack
  // -------------------------------------------------------------------------
  const ProgressTrack = () => {
    if (evolution.length < 2) return null;
    const sorted = evoSorted;
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
      { label: 'Peso',             d: delta(first.peso,            last.peso,            'kg', true) },
      { label: 'IMC',              d: delta(first.imc,             last.imc,             '',   true) },
      { label: 'Gordura',          d: delta(first.gordura,         last.gordura,         '%',  true) },
      { label: 'Visceral',         d: delta(first.gorduraVisceral, last.gorduraVisceral, '',   true) },
      { label: 'Massa Muscular',   d: delta(first.massaMuscular,   last.massaMuscular,   '%',  false) },
    ].filter(i => i.d !== null);

    return (
      <Card
        elevation={0}
        sx={{
          px: { xs: 2.25, md: 3 },
          py: 2,
          mb: 3,
          borderRadius: T.radius.lg,
          bgcolor: T.glass.bg,
          backdropFilter: T.glass.blur,
          border: T.border.glass,
          boxShadow: T.shadow.soft,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
          <TimelineIcon sx={{ fontSize: 18, color: T.color.primary }} />
          <Typography sx={{ fontWeight: 700, color: '#1b5e20', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Progresso
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            desde {new Date(first.dataConsulta).toLocaleDateString('pt-BR')} ({sorted.length} consultas)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.25, md: 2 } }}>
          {items.map(({ label, d }) => (
            <MuiTooltip key={label} title={`Variação desde ${new Date(first.dataConsulta).toLocaleDateString('pt-BR')}`} placement="top" arrow>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.85,
                  borderRadius: 999,
                  bgcolor: '#fff',
                  border: T.border.subtle,
                  cursor: 'default',
                  transition: T.motion,
                  '&:hover': { boxShadow: T.shadow.elev, transform: 'translateY(-1px)' },
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600 }}>{label}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: d.color, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
                  {d.arrow} {Math.abs(d.diff)}{d.unit}
                </Typography>
              </Box>
            </MuiTooltip>
          ))}
        </Box>
      </Card>
    );
  };

  // -------------------------------------------------------------------------
  // AnalyticsStage (Toolbar + Chart unificados)
  // -------------------------------------------------------------------------
  const AnalyticsStage = () => {
    const chartData = evoSorted.map((e) => {
      const d = e.dataConsulta ? new Date(e.dataConsulta) : null;
      return {
        date: d && !isNaN(d) ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}` : '—',
        peso: e.peso ?? 0,
      };
    });

    let pesoAtual = '-', pesoIdeal = '-';
    if (evoSorted.length) {
      const last = evoSorted[evoSorted.length - 1];
      pesoAtual = last.peso ?? '-';
      pesoIdeal = last.pesoIdeal ?? '-';
    }

    const quickRanges = [
      { label: '7d', days: 7 },
      { label: '30d', days: 30 },
      { label: '90d', days: 90 },
      { label: '180d', days: 180 },
    ];

    return (
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: T.radius.lg,
          bgcolor: '#fff',
          border: T.border.subtle,
          boxShadow: T.shadow.soft,
          overflow: 'hidden',
        }}
      >
        <style>{dateInputStyles}</style>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '300px 1fr' },
            minHeight: 380,
          }}
        >
          {/* Toolbar lateral */}
          <Box
            sx={{
              p: { xs: 2.25, md: 2.75 },
              bgcolor: 'rgba(46,125,50,0.025)',
              borderRight: { xs: 'none', lg: T.border.subtle },
              borderBottom: { xs: T.border.subtle, lg: 'none' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon sx={{ fontSize: 18, color: T.color.primary }} />
              <Typography sx={{ fontWeight: 700, color: '#1b5e20', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Período
              </Typography>
            </Box>

            {/* Quick filters */}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {quickRanges.map(qr => {
                const active = activeQuickRange === qr.days;
                return (
                  <Box
                    key={qr.days}
                    onClick={() => applyQuickRange(qr.days)}
                    sx={{
                      px: 1.5, py: 0.6,
                      borderRadius: 999,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: active ? T.color.primary : '#fff',
                      color: active ? '#fff' : '#2e7d32',
                      border: active ? 'none' : '1.5px solid rgba(46,125,50,0.18)',
                      boxShadow: active ? T.shadow.elev : 'none',
                      transition: T.motion,
                      '&:hover': {
                        bgcolor: active ? T.color.primary : 'rgba(46,125,50,0.08)',
                      },
                    }}
                  >
                    {qr.label}
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ borderColor: 'rgba(46,125,50,0.08)' }} />

            <Box>
              <Typography sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                De
              </Typography>
              <input
                type="date"
                className="fn-date-input"
                value={`${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth()+1).padStart(2,'0')}-${String(dateRange.from.getDate()).padStart(2,'0')}`}
                onChange={e => {
                  const newFrom = new Date(e.target.value);
                  setDateRange({ from: newFrom, to: dateRange.to < newFrom ? newFrom : dateRange.to });
                  setActiveQuickRange(null);
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                Até
              </Typography>
              <input
                type="date"
                className="fn-date-input"
                value={`${dateRange.to.getFullYear()}-${String(dateRange.to.getMonth()+1).padStart(2,'0')}-${String(dateRange.to.getDate()).padStart(2,'0')}`}
                onChange={e => {
                  const newTo = new Date(e.target.value);
                  setDateRange({ from: dateRange.from > newTo ? newTo : dateRange.from, to: newTo });
                  setActiveQuickRange(null);
                }}
              />
            </Box>

            <Box sx={{
              p: 1.25,
              bgcolor: 'rgba(46,125,50,0.06)',
              borderRadius: T.radius.md,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <CalendarMonthIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#1b5e20', fontSize: '0.74rem', fontWeight: 600, lineHeight: 1.3 }}>
                {dateRange.from.toLocaleDateString('pt-BR')} – {dateRange.to.toLocaleDateString('pt-BR')}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => fetchEvolution(userId)}
              sx={{
                borderRadius: T.radius.md,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
                py: 1.1,
                mt: 'auto',
                '&:hover': { boxShadow: T.shadow.elev },
              }}
            >
              Aplicar
            </Button>
          </Box>

          {/* Chart */}
          <Box sx={{ p: { xs: 2.25, md: 3 }, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1b5e20', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                  Evolução do Peso
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                  Variação ao longo do período selecionado
                </Typography>
              </Box>
              {chartData.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    bgcolor: 'rgba(67,160,71,0.08)', color: '#2e7d32',
                    px: 1.25, py: 0.5, borderRadius: 999,
                    fontWeight: 700, fontSize: '0.78rem',
                    border: '1px solid rgba(67,160,71,0.2)',
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#43a047' }} />
                    Atual: {pesoAtual} kg
                  </Box>
                  {pesoIdeal !== '-' && pesoIdeal != null && (
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.75,
                      bgcolor: '#fff7ed', color: '#e65100',
                      px: 1.25, py: 0.5, borderRadius: 999,
                      fontWeight: 700, fontSize: '0.78rem',
                      border: '1px solid rgba(255,152,0,0.25)',
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800' }} />
                      Meta: {pesoIdeal} kg
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ flex: 1, minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {chartData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TimelineIcon sx={{ fontSize: 48, color: 'rgba(46,125,50,0.25)', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nenhum dado de peso encontrado para o período.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                    Ajuste o período ou registre uma consulta.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ width: '100%' }}>
                  <WeightEvolutionChart data={chartData} pesoIdeal={pesoIdeal !== '-' ? Number(pesoIdeal) : undefined} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    );
  };

  // -------------------------------------------------------------------------
  // HistoryCard (tabs estilo segmented + DataTable)
  // -------------------------------------------------------------------------
  const HistoryCard = () => {
    const [tab, setTab] = useState(0);
    const handlePageChange = (_, newPage) => {
      if (newPage === currentPage) return;
      setCurrentPage(newPage);
    };

    return (
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: T.radius.lg,
          bgcolor: '#fff',
          border: T.border.subtle,
          boxShadow: T.shadow.soft,
          p: { xs: 2.25, md: 2.75 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ fontSize: 18, color: T.color.primary }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1b5e20', letterSpacing: '-0.3px' }}>
              Histórico antropométrico
            </Typography>
          </Box>
          {evolution.length > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
              {evolution.length} {evolution.length === 1 ? 'registro' : 'registros'} no período
            </Typography>
          )}
        </Box>

        {/* Segmented tabs */}
        {evolution.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              p: 0.5,
              bgcolor: 'rgba(46,125,50,0.05)',
              borderRadius: T.radius.md,
              mb: 2,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(46,125,50,0.2)', borderRadius: 2 },
            }}
          >
            {evolution.map((e, idx) => {
              const d = e.dataConsulta ? new Date(e.dataConsulta) : null;
              const dateLabel = d && !isNaN(d) ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}` : `#${idx+1}`;
              const active = tab === idx;
              return (
                <Box
                  key={idx}
                  onClick={() => setTab(idx)}
                  sx={{
                    px: 1.75, py: 0.85,
                    borderRadius: 1.5,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    bgcolor: active ? '#fff' : 'transparent',
                    color: active ? '#1b5e20' : 'text.secondary',
                    boxShadow: active ? T.shadow.soft : 'none',
                    transition: T.motion,
                    '&:hover': { color: '#1b5e20' },
                  }}
                >
                  Consulta {idx + 1} <Box component="span" sx={{ fontWeight: 500, opacity: 0.7, ml: 0.5 }}>· {dateLabel}</Box>
                </Box>
              );
            })}
          </Box>
        ) : null}

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          {evolution[tab]
            ? <DataTable embedded data={{ ...evolution[tab], motivoConsulta: evolution[tab]?.motivoConsulta || patientMotivoConsulta || '' }} />
            : <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">Sem dados para o período selecionado.</Typography>
              </Box>}
        </Box>

        <Box
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: T.border.subtle,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
            Página <Box component="span" sx={{ fontWeight: 700, color: '#1b5e20' }}>{currentPage}</Box> de {totalPages}
          </Typography>
          <Pagination
            color="success"
            page={currentPage}
            count={totalPages}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            size="small"
            sx={{ '& .MuiPaginationItem-root': { fontWeight: 600 } }}
          />
        </Box>
      </Card>
    );
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (!userId) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#f8fff9' }}>
        <Typography variant="h6" color="text.secondary">Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)',
      width: '100%',
    }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          p: { xs: 2, md: 3 },
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <TopBar />
          <HeroPatientCard />
          <MetricStrip />
          <ProgressTrack />
          <AnalyticsStage />
          <HistoryCard />
        </Container>
      </Box>
    </Box>
  );
}
