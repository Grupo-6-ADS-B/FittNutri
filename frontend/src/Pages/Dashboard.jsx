import React from 'react';
import { Box, CssBaseline, Grid, Card, Typography, Avatar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Chip, styled, Button } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import MailIcon from '@mui/icons-material/Mail';
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
import { Link, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

// --- Componentes Internos ---
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

const kpiData = [
  { title: 'IMC', value: '22,5', icon: BarChartIcon, colorKey: 'primary' },
  { title: 'Peso Atual', value: '68 kg', icon: PersonIcon, colorKey: 'secondary' },
  { title: 'Meta de Peso', value: '65 kg', icon: StarIcon, colorKey: 'secondary' },
  { title: 'Consultas Realizadas', value: '12', icon: CheckCircleIcon, colorKey: 'secondary' },
];

const menuItems = [
  { label: 'Usuários', path: '/Gestor', icon: <HomeIcon /> },
  { label: 'Resumo de dados', path: '/resumoCircunferencia', icon: <FolderIcon /> },
  { label: 'Gráficos', path: '/graficos', icon: <BarChartIcon /> },
  // { label: 'Notificações', path: '/notificacoes', icon: <NotificationsIcon /> },
  // { label: 'Localização', path: '/localizacao', icon: <LocationOnIcon /> },
];


import { useLocation } from 'react-router-dom';

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
    <Card onClick={handleClick} sx={{ height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 3, cursor: 'pointer' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1, pb: 0 }}>
        {IconComponent && React.createElement(IconComponent, { sx: { color: accent, fontSize: 20 } })}
      </Box>
      <Box sx={{ px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {colorKey === 'primary' && (
          <Box sx={{ bgcolor: colorDark, p: 1, borderRadius: 1 }}>
            <AttachMoneyIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
        )}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="bold">{title}</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color: colorDark }}>{value}</Typography>
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
  return (
    <Card sx={{ p: 2, boxShadow: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8 }}>Evolução do Peso</Typography>
        <Chip
          icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
          label="Ver detalhes"
          onClick={() => navigate('/evolucao-peso')}
          sx={{ bgcolor: secondary, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        />
      </Box>
      <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 1.25, borderBottom: '1px solid #ccc', pb: 0.5, px: 1 }}>
        <Box sx={{ width: 30, textAlign: 'right', mr: 1 }}>
            {[80, 75, 70, 65, 60, 55].map((val) => (
                <Typography key={val} variant="caption" sx={{ display: 'block', height: '32px', color: 'text.secondary', fontSize: '0.7rem' }}>
                    {val}
                </Typography>
            ))}
        </Box>
        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'].map((month, index) => (
          <Box key={month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            {index === 6 && (
                <Typography variant="caption" sx={{ bgcolor: primary, color: 'white', p: 0.5, borderRadius: 1, fontSize: '0.6rem' }}>65 kg</Typography>
            )}
            <Box sx={{ height: `${(index % 3) * 15 + 30}%`, width: '40%', bgcolor: primary, mb: 0.5, borderRadius: '4px 4px 0 0' }} />
            <Box sx={{ height: `${(index % 4) * 10 + 20}%`, width: '40%', bgcolor: secondary, mb: 0.5, borderRadius: '4px 4px 0 0' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>{month}</Typography>
          </Box>
        ))}
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

  return (
    <Card sx={{ p: 2, boxShadow: 3, height: 220 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Box sx={{ height: 120, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(to top, ${alpha(secondary, 0.1)}, ${alpha(secondary, 0.35)}, ${alpha(secondary, 0.08)})`,
              clipPath: 'polygon(0% 60%, 10% 40%, 20% 55%, 30% 30%, 40% 50%, 50% 20%, 60% 45%, 70% 30%, 80% 50%, 90% 20%, 100% 35%, 100% 100%, 0% 100%)',
              opacity: 0.9
            }} />
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              clipPath: 'polygon(0% 80%, 10% 60%, 20% 75%, 30% 50%, 40% 65%, 50% 40%, 60% 60%, 70% 45%, 80% 60%, 90% 35%, 100% 50%, 100% 100%, 0% 100%)',
              backgroundImage: `linear-gradient(to top, ${alpha(primary, 0.08)}, ${alpha(primary, 0.35)}, ${alpha(primary, 0.08)})`,
              opacity: 0.9
            }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: secondary, mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">Meta A</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: primary, mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">Meta B</Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', textAlign: 'right', mb: 1 }}>D S T Q Q S S</Typography>
            <Grid container spacing={0.5} justifyContent="center" fontSize="0.7rem">
              {days.map((day, index) => (
                <Grid item xs={1.7} key={index} sx={{ textAlign: 'center' }}>
                  {day && (
                    <Box
                      sx={{
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        lineHeight: '20px',
                        bgcolor: day.color || 'transparent',
                        color: day.color ? 'white' : 'black',
                        mx: 'auto'
                      }}
                    >
                      {day.val || day}
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

const DonutChartCard = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const navigate = useNavigate();

  return (
    <Card sx={{ p: 2, boxShadow: 3, height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.8 }}>Distribuição de Macronutrientes</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
        <Box sx={{ width: 140, height: 140, position: 'relative', my: 2 }}>
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

        <Box sx={{ textAlign: 'center' }}>
          {['Carboidratos', 'Proteínas', 'Gorduras'].map((text, index) => (
            <Typography key={index} variant="body2" color="text.secondary">{text}</Typography>
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
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <ResultChartCard />
          <LineChartCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <DonutChartCard />
        </Grid>
      </Grid>
    </Box>
  );
}
export default function Dashboard() {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', minHeight: '90vh', background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)', width: '100%' }}>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          bgcolor: 'transparent',
          minHeight: '90vh',
          p: 2,
        }}
      >
        <MainContent />
      </Box>
    </Box>
  );
}
