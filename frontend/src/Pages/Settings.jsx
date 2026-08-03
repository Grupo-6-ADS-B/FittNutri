import React from 'react';
import { Box, Button, Paper, Typography, Switch, FormControlLabel, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../contexts/ThemeModeContext';

export default function Settings() {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper sx={{ p: 4, width: 560, bgcolor: 'background.paper', color: 'text.primary' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Configurações</Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Tema atual: {mode === 'dark' ? 'Escuro' : 'Claro'}
        </Typography>

        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
          label={mode === 'dark' ? 'Tema escuro' : 'Tema claro'}
        />

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={toggleMode}>
            Alternar para {mode === 'dark' ? 'claro' : 'escuro'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/gestor')}>Voltar ao gerenciamento</Button>
        </Box>
      </Paper>
    </Box>
  );
}
