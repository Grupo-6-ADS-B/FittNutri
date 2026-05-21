import React, { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Informe a senha atual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação devem ser iguais.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const { data } = await api.patch('/users/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess(data?.message || 'Senha alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(message || 'Não foi possível alterar a senha.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, width: 560 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Alterar senha</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField fullWidth label="Senha atual" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Nova senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Confirmar nova senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained">Salvar</Button>
          <Button variant="outlined" onClick={() => navigate('/profile')}>Cancelar</Button>
          <Button variant="outlined" onClick={() => navigate('/gestor')}>Voltar ao gerenciamento</Button>
        </Box>
      </Paper>
    </Box>
  );
}
