import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import logo from '/logo.jpg';
import api from '../utils/api';
import { useThemeMode } from '../contexts/ThemeModeContext';

function Header({
  isPublic = false,
  onSwitchToLogin,
  onSwitchToRegister,
  onScrollToCarousel,
  onScrollToValues,
  onScrollToContact,
  onScrollToReviews
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const isHome = location?.pathname === '/';

  // Dados do usuário — apenas usados no header privado
  const userName = sessionStorage.getItem('nomeUsuario') || localStorage.getItem('nomeUsuario');
  const userId = sessionStorage.getItem('idUsuario') || localStorage.getItem('idUsuario');
  const [userPhoto, setUserPhoto] = useState(
    sessionStorage.getItem('fotoUsuario') || localStorage.getItem('fotoUsuario')
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const userMenuRef = useRef(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    if (isPublic) return;

    const loadUserPhoto = async () => {
      try {
        const res = await api.get('/users/me');
        if (res.data?.foto) {
          setUserPhoto(res.data.foto);
          sessionStorage.setItem('fotoUsuario', res.data.foto);
          localStorage.setItem('fotoUsuario', res.data.foto);
          return;
        }
      } catch (err) {
        console.warn('Erro ao carregar de /users/me:', err.message);
      }

      if (userId) {
        try {
          const res = await api.get(`/users/${userId}`);
          if (res.data?.foto) {
            setUserPhoto(res.data.foto);
            sessionStorage.setItem('fotoUsuario', res.data.foto);
            localStorage.setItem('fotoUsuario', res.data.foto);
          }
        } catch (err) {
          console.warn('Erro ao carregar foto com ID:', err.message);
        }
      }
    };

    if (userId) loadUserPhoto();

    const handleUserPhotoUpdate = () => {
      const storedPhoto = sessionStorage.getItem('fotoUsuario') || localStorage.getItem('fotoUsuario') || '';
      setUserPhoto(storedPhoto);
      if (!storedPhoto && userId) loadUserPhoto();
    };

    window.addEventListener('user-profile-updated', handleUserPhotoUpdate);
    window.addEventListener('storage', handleUserPhotoUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleUserPhotoUpdate);
      window.removeEventListener('storage', handleUserPhotoUpdate);
    };
  }, [userId, isPublic]);

  const handleMenuOpen = (event) => {
    setAnchorEl(userMenuRef.current || event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    ['token', 'nomeUsuario', 'fotoUsuario', 'idUsuario'].forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    navigate('/login', { replace: true });
  };

  const logoDestination = isPublic ? '/' : '/gestor';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.96),
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 2, px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={logo}
            alt="FittNutri Logo"
            sx={{ height: 50, width: 90, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => navigate(logoDestination)}
          />
          <Box>
            <Typography
              variant="h4"
              component="div"
              onClick={() => navigate(logoDestination)}
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { color: 'primary.dark' }
              }}
            >
              FittNutri
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
              Software para nutricionistas
            </Typography>
          </Box>
        </Box>

        {/* Nav links — apenas na home pública */}
        {isPublic && isHome && (
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button onClick={() => onScrollToCarousel?.()} sx={{ fontWeight: 500, color: 'text.primary', px: 3, py: 1.5, borderRadius: 3, '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)', transform: 'translateY(-1px)' } }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Funcionalidades</Typography>
            </Button>
            <Button onClick={() => onScrollToValues?.()} sx={{ fontWeight: 500, color: 'text.primary', px: 3, py: 1.5, borderRadius: 3, '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)', transform: 'translateY(-1px)' } }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Sobre nós</Typography>
            </Button>
            <Button onClick={() => onScrollToReviews?.()} sx={{ fontWeight: 500, color: 'text.primary', px: 3, py: 1.5, borderRadius: 3, '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)', transform: 'translateY(-1px)' } }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Avaliações</Typography>
            </Button>
            <Button onClick={() => onScrollToContact?.()} sx={{ fontWeight: 500, color: 'text.primary', px: 3, py: 1.5, borderRadius: 3, '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)', transform: 'translateY(-1px)' } }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Fale conosco</Typography>
            </Button>
          </Stack>
        )}

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Toggle de tema — sempre visível */}
          <Tooltip title={mode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
            <IconButton
              onClick={toggleMode}
              aria-label={mode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.9),
                color: theme.palette.text.primary,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08),
                },
              }}
            >
              {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {isPublic ? (
            /* Header público: Entrar + Cadastrar */
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onSwitchToLogin?.()}
                sx={{ borderRadius: 3, px: 3, py: 1.5, borderWidth: 2, '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)', borderWidth: 2, transform: 'translateY(-1px)' } }}
              >
                Entrar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onSwitchToRegister?.()}
                sx={{ borderRadius: 3, px: 3, py: 1.5, background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)', '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(46,125,50,0.3)' } }}
              >
                Cadastrar
              </Button>
            </>
          ) : (
            /* Header privado: avatar + menu */
            <Box ref={userMenuRef} sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                aria-controls={menuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                sx={{ p: 0 }}
              >
                <Avatar
                  alt="User Avatar"
                  src={userPhoto || ''}
                  sx={{
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    backgroundColor: theme.palette.primary.main,
                    img: { referrerPolicy: 'no-referrer' }
                  }}
                  crossOrigin="anonymous"
                  onError={() => console.warn('Erro ao carregar foto do usuário. URL:', userPhoto)}
                >
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Bem vindo, {userName}!</Typography>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: { bgcolor: 'background.paper', borderColor: 'divider', boxShadow: theme.shadows[4], minWidth: 200 }
                }}
              >
                <MenuItem onClick={() => navigate('/gestor')}>Meus pacientes</MenuItem>
                <MenuItem onClick={() => navigate('/inicio')}>Página inicial do site</MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate('/profile')}>Ver perfil</MenuItem>
                <MenuItem onClick={() => navigate('/profile/edit')}>Editar informações</MenuItem>
                <MenuItem onClick={() => navigate('/profile/password')}>Alterar senha</MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>Configurações</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
            </Box>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export { Header };
