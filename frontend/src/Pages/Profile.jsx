import React from 'react';
import { Box, Typography, Avatar, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem('nomeUsuario') || localStorage.getItem('nomeUsuario') || '';
  const userEmail = sessionStorage.getItem('emailUsuario') || localStorage.getItem('emailUsuario') || '';
  const userPhoto = sessionStorage.getItem('fotoUsuario') || localStorage.getItem('fotoUsuario') || '';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper sx={{ p: 4, width: 560 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Avatar src={userPhoto} sx={{ width: 96, height: 96, bgcolor: '#2e7d32' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{userName || 'Usuário'}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{userEmail || '—'}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => navigate('/profile/edit')}>Editar informações</Button>
          <Button variant="outlined" onClick={() => navigate('/profile/password')}>Alterar senha</Button>
          <Button variant="outlined" onClick={() => navigate('/gestor')}>Voltar ao gerenciamento</Button>
        </Box>
      </Paper>
    </Box>
  );
}
