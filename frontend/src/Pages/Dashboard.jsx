import CalendarDemo from "../components/CalendarDemo";
import React from 'react';
import { Box, CssBaseline, Grid, Card, Typography, Avatar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Chip, styled, Button } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import AddTaskIcon from '@mui/icons-material/AddTask';
import FaceIcon from '@mui/icons-material/Face';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import BalanceIcon from '@mui/icons-material/Balance';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MailIcon from '@mui/icons-material/Mail';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const drawerWidth = 240;


const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
}));

export default function Dashboard() {
  const theme = useTheme();
  const [antropo, setAntropo] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  let userId = location.state?.user?.id;
  if (!userId) {
    userId = sessionStorage.getItem('idUsuario') || localStorage.getItem('idUsuario');
    if (userId) userId = parseInt(userId, 10);
  }

  React.useEffect(() => {
    if (!userId) {
      navigate('/');
    }
  }, [userId, navigate]);

  React.useEffect(() => {
    async function fetchAntropo() {
      setLoading(true);
      try {
        if (userId) {
          const res = await api.get(`/anthropometric-data/paciente/${userId}`);
          const lista = Array.isArray(res.data) ? res.data : [];
          setAntropo(lista[0] || {});
        }
      } catch {
        setAntropo({});
      }
      setLoading(false);
    }
    fetchAntropo();
  }, [userId]);

  const kpiData = [
    { title: 'IMC', value: antropo.imc ?? '-', icon: FactCheckIcon, colorKey: 'primary' },
    { title: 'Gordura (%)', value: antropo.porcentagemGordura ?? '-', icon: BalanceIcon, colorKey: 'primary' },
    { title: 'Massa Muscular', value: antropo.massaMuscular ?? '-', icon: FitnessCenterIcon, colorKey: 'secondary' },
    { title: 'Gordura Visceral', value: antropo.gorduraVisceral ?? '-', icon: ManageAccountsIcon, colorKey: 'primary' },
    { title: 'Taxa Metabolica Basal', value: antropo.taxaMetabolicaBasal ?? '-', icon: ContentPasteSearchIcon, colorKey: 'secondary' },
    { title: 'Idade Metabólica', value: antropo.idadeMetabolica ?? '-', icon: PsychologyIcon, colorKey: 'primary' },
  ];

  const menuItems = [
    { label: 'Usuários', path: '/gestor', icon: <HomeIcon /> },
    { label: 'Resumo de dados', path: '/resumoCircunferencia', icon: <FolderIcon /> },
    { label: 'Gráficos', path: '/dashboard', icon: <BarChartIcon /> },
    { label: 'Dietas', path: '/dietas', icon: <MailIcon /> },
    { label: 'Consultas', path: '/consultas', icon: <AddTaskIcon /> },
    // { label: 'Notificações', path: '/notificacoes', icon: <NotificationsIcon /> },
    // { label: 'Localização', path: '/localizacao', icon: <LocationOnIcon /> },
  ];

  // --- Sidebar ---
  function Sidebar() {
    const theme = useTheme();
    const bg = theme.palette.primary.dark || theme.palette.primary.main;
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user || {
      name: 'Usuário',
      email: 'usuario@exemplo.com',
      avatar: '',
    };
    return (
      <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0 }}>
        <Box sx={{ height: '100%', bgcolor: bg, color: 'white', position: 'fixed', width: drawerWidth }}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              onClick={() => navigate('/perfil')}
              src={user.avatar || undefined}
              sx={{ width: 64, height: 64, bgcolor: 'white', color: theme.palette.primary.main, mx: 'auto', mb: 1, boxShadow: 5, cursor: 'pointer', fontSize: 32 }}
            >
              {!user.avatar && <PersonIcon fontSize="large" />}
            </Avatar>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>{user.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, color: 'white' }}>{user.email}</Typography>
          </Box>
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding component={Link} to={item.path}>
                <CustomListItemButton selected={item.path === '/inicio'}>
                  <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ sx: { color: 'white', textTransform: 'none' } }} />
                </CustomListItemButton>
              </ListItem>
            ))}
          </List>
            </Box>
      </Box>
    );
  }

  const KPICard = ({ title, value, icon: IconComponent, colorKey = 'primary' }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const colorMain = theme.palette[colorKey]?.main || theme.palette.primary.main;
    const colorDark = theme.palette[colorKey]?.dark || colorMain;
    const accent = theme.palette.secondary?.main || theme.palette.secondary;

    const handleClick = () => {
      const slug = title.toLowerCase().replace(/\s+/g, '-');
      navigate(`/dashboard/kpi/${slug}`);
    };

    return (
      <Card onClick={handleClick} sx={{ height: 110, minWidth: 230, maxWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 3, cursor: 'pointer', p: 2 }}>
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

  const ResultChartCard = () => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const navigate = useNavigate();
    
    const pesoData = [78, 77.5, 77, 76.5, 76, 75.5, 75, 74.5, 74];
    const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5', 'Semana 6', 'Semana 7', 'Semana 8', 'Semana 9'];
    
    const width = 1000;
    const height = 250;
    const padding = 50;
    const rightPadding = 100;
    const minPeso = 73;
    const maxPeso = 79;
    
    const getY = (peso) => padding + ((maxPeso - peso) / (maxPeso - minPeso)) * (height - padding * 2);
    
    const getX = (i) => padding + i * ((width - padding - rightPadding) / (pesoData.length - 1));
    
    const points = pesoData.map((peso, i) => `${getX(i)},${getY(peso)}`).join(' ');
    const [showSelect, setShowSelect] = React.useState(false);
    
    const pesoAtual = 78;
    const pesoIdeal = 72;
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
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#ff9800', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 14, boxShadow: 1, cursor: 'pointer' }}>
                Peso Atual:&nbsp;{pesoAtual} kg
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#4caf50', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', fontSize: 14, boxShadow: 1, cursor: 'pointer' }}>
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

  const LineChartCard = () => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    const days = [
      null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      16, 17, { val: 18, color: secondary }, { val: 19, color: secondary }, { val: 20, color: secondary },
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30
    ];
  };

  const DonutChartCard = () => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const navigate = useNavigate();

    
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
            <Typography variant="h4" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: primary }}>Carb 40%</Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            {legendData.map((item, idx) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 1, gap: 1.5 }}>
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: item.color, mr: 1, border: '2px solid #eee' }} />
                <Typography variant="body2" sx={{ minWidth: 90 }}>{item.label}</Typography>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">{item.value}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            label="Ver detalhes"
            onClick={() => navigate('/macros')}
            sx={{ bgcolor: theme.palette.secondary.main, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          />
        </Box>
      </Card>
    );
  };

  function MainContent() {
    const navigate = useNavigate();
    return (
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            <Typography variant="h5" fontWeight="bold">Resumo Nutricional</Typography>
          </Box>
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
            <LineChartCard />

              <Card sx={{ width: 1000, minWidth: 1600, maxWidth: 1600, p: 3, mt: 2, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', boxShadow: 3 }}>

                <Box sx={{ width: 540, pr: 4 }}>
                  <CalendarCard />
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

  function CalendarCard() {
    const [dateRange, setDateRange] = React.useState({
      from: new Date(2025, 5, 12),
      to: new Date(2025, 6, 15),
    });
    
    return (
      <Box sx={{ width: 540 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Calendário</Typography>
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#f8fff9', boxShadow: 1 }}>
          <input type="month" value={dateRange.from.toISOString().slice(0,7)} onChange={e => {
            const [year, month] = e.target.value.split('-');
            setDateRange({ ...dateRange, from: new Date(year, month-1, 1) });
          }} style={{ marginBottom: 12, fontSize: 16, padding: 8, borderRadius: 12, border: '1px solid #e0e0e0', background: '#f8fff9', width: 220 }} />
          <input type="date" value={dateRange.from.toISOString().slice(0,10)} onChange={e => {
            setDateRange({ ...dateRange, from: new Date(e.target.value) });
          }} style={{ marginBottom: 12, fontSize: 16, padding: 8, borderRadius: 12, border: '1px solid #e0e0e0', background: '#f8fff9', width: 220 }} />
          <input type="date" value={dateRange.to.toISOString().slice(0,10)} onChange={e => {
            setDateRange({ ...dateRange, to: new Date(e.target.value) });
          }} style={{ fontSize: 16, padding: 8, borderRadius: 12, border: '1px solid #e0e0e0', background: '#f8fff9', width: 220 }} />
          <Box sx={{ mt: 2, fontSize: 15, color: '#666' }}>
            Selecionado: {dateRange.from.toLocaleDateString()} até {dateRange.to.toLocaleDateString()}
          </Box>
        </Box>
      </Box>
    );
  }

  
  function ConsultasBarChart() {
    
    const consultas = [
      { data: '12/06', qtd: 2 },
      { data: '15/06', qtd: 1 },
      { data: '18/06', qtd: 3 },
      { data: '22/06', qtd: 1 },
      { data: '25/06', qtd: 2 },
      { data: '28/06', qtd: 1 },
      { data: '30/06', qtd: 4 },
    ];
    const maxQtd = Math.max(...consultas.map(c => c.qtd));
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
      <Sidebar />
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
