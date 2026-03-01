import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Container, Stack, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import api from '../utils/api';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/reset-password', { token, password });
      setSuccess('Senha redefinida com sucesso! Você já pode fazer login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      let msg = err.response?.data?.error || err.message;
      setError(msg || 'Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 8 },
        height: '90vh',
        px: 2,
        backgroundImage: `url('/fundo.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.28)',
          zIndex: 0,
          backdropFilter: 'blur(4px)',
        }}
      />
      <Container sx={{ position: 'relative', zIndex: 2, maxWidth: '500px !important', border: '1px solid #ddd', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', backgroundColor: 'rgba(255,255,255,0.96)' }}>
        <Paper elevation={0} sx={{ p: 3, background: 'transparent' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', textAlign: 'center' }}>
            Redefinir Senha
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                type="password"
                label="Nova senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
                variant="outlined"
              />
              <TextField
                type="password"
                label="Confirmar nova senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ py: 1.5 }}
                disabled={loading}
              >
                Redefinir Senha
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPassword;
