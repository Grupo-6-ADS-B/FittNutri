import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const currentTheme = localStorage.getItem('themeMode') || 'light';

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('themeMode', nextTheme);
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper sx={{ p: 4, width: 560 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Configurações</Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Tema atual: {currentTheme === 'dark' ? 'Escuro' : 'Claro'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={toggleTheme}>
            Alternar para {currentTheme === 'dark' ? 'claro' : 'escuro'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/gestor')}>Voltar ao gerenciamento</Button>
          <Button variant="outlined" onClick={() => navigate('/profile/password')}>Alterar senha</Button>
        </Box>
      </Paper>
    </Box>
  );
}
