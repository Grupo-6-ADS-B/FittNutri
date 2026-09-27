import React, { useEffect, useRef, useState } from 'react';
import { Alert, Avatar, Box, Button, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import api from '../utils/api';

export default function EditProfile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preview, setPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(sessionStorage.getItem('nomeUsuario') || localStorage.getItem('nomeUsuario') || '');
    setEmail(sessionStorage.getItem('emailUsuario') || localStorage.getItem('emailUsuario') || '');
    setPreview(sessionStorage.getItem('fotoUsuario') || localStorage.getItem('fotoUsuario') || '');
  }, []);

  useEffect(() => {
    if (!avatarFile) return;
    const objectUrl = URL.createObjectURL(avatarFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const userId = sessionStorage.getItem('idUsuario') || localStorage.getItem('idUsuario');
    if (!userId) {
      setError('Não foi possível identificar o usuário logado.');
      return;
    }

    let foto = sessionStorage.getItem('fotoUsuario') || localStorage.getItem('fotoUsuario') || '';
    if (avatarFile) {
      try {
        foto = await readFileAsBase64(avatarFile);
      } catch (err) {
        setError('Não foi possível ler a foto selecionada.');
        return;
      }
    }

    const payload = {
      nome: name,
      email,
      foto,
    };

    try {
      const { data } = await api.patch(`/users/${userId}`, payload);

      sessionStorage.setItem('nomeUsuario', data.nome || name);
      localStorage.setItem('nomeUsuario', data.nome || name);
      sessionStorage.setItem('emailUsuario', data.email || email);
      localStorage.setItem('emailUsuario', data.email || email);
      sessionStorage.setItem('fotoUsuario', data.foto || foto);
      localStorage.setItem('fotoUsuario', data.foto || foto);
      window.dispatchEvent(new Event('user-profile-updated'));

      setSuccess('Informações atualizadas com sucesso.');
      setAvatarFile(null);
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Erro ao atualizar o usuário.';
      setError(message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper component="form" onSubmit={handleSave} sx={{ p: 4, width: 560, bgcolor: 'background.paper', color: 'text.primary', border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 2 }}>
          <Avatar src={preview || ''} sx={{ width: 80, height: 80, bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 1) }} />
          <Box>
            <Typography variant="h6">Editar perfil</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Atualize nome, email e foto</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField fullWidth label="Nome" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />

        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>Escolher foto</Button>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {avatarFile ? avatarFile.name : 'Nenhum arquivo selecionado'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained">Salvar</Button>
          <Button variant="outlined" onClick={() => navigate('/profile')}>Cancelar</Button>
          <Button variant="outlined" onClick={() => navigate('/gestor')}>Voltar ao gerenciamento</Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!success}
        autoHideDuration={3500}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
