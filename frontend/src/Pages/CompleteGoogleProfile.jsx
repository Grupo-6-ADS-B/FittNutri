import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Container,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CreditCard as CpfIcon,
  MedicalInformation as CrnIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function CompleteGoogleProfile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    setError: setFieldError,
    formState: { errors },
  } = useForm({ defaultValues: { cpf: '', crn: '' } });

  const handleCpfChange = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    return v;
  };

  const handleCrnChange = (value) => {
    let v = value.replace(/[^\dA-Za-z]/g, '');
    v = v.replace(/(\d{1,6})([A-Za-z]{0,2})/, (m, n, uf) => (uf ? `${n}/${uf.toUpperCase()}` : n));
    return v;
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await api.patch('/users/complete-profile', { cpf: data.cpf, crn: data.crn });
      sessionStorage.setItem('perfilCompleto', 'true');
      localStorage.setItem('perfilCompleto', 'true');
      navigate('/gestor', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.mensagem || err.response?.data?.error || err.message;
      const detalhes = err.response?.data?.detalhes;
      if (detalhes?.cpf) {
        setFieldError('cpf', { type: 'server', message: detalhes.cpf });
      } else if (detalhes?.crn) {
        setFieldError('crn', { type: 'server', message: detalhes.crn });
      } else if (status === 409) {
        const normalized = (msg || '').toLowerCase();
        if (normalized.includes('cpf')) {
          setFieldError('cpf', { type: 'server', message: msg });
        } else if (normalized.includes('crn')) {
          setFieldError('crn', { type: 'server', message: msg });
        } else {
          setError(msg || 'Dado já cadastrado.');
        }
      } else {
        setError(msg || 'Erro ao completar perfil. Tente novamente.');
      }
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
        minHeight: 'calc(100vh - 160px)',
        py: { xs: 4, md: 8 },
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
          background:
            theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.72)' : 'rgba(0,0,0,0.28)',
          zIndex: 0,
          backdropFilter: 'blur(4px)',
        }}
      />
      <Container
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '480px !important',
          backgroundColor: alpha(
            theme.palette.background.paper,
            theme.palette.mode === 'dark' ? 0.9 : 0.96
          ),
          p: 3,
          borderRadius: 0.5,
          boxShadow: theme.shadows[3],
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Complete seu cadastro
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Para usar o FittNutri, precisamos do seu CPF e número de CRN profissional.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="cpf"
              control={control}
              rules={{
                required: 'CPF é obrigatório',
                minLength: { value: 14, message: 'CPF deve estar completo' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="CPF"
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message}
                  inputProps={{ maxLength: 14 }}
                  InputProps={{
                    startAdornment: <CpfIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                  variant="outlined"
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    const formatted = handleCpfChange(e.target.value);
                    setValue('cpf', formatted);
                    field.onChange(formatted);
                  }}
                />
              )}
            />

            <Controller
              name="crn"
              control={control}
              rules={{
                required: 'CRN é obrigatório',
                minLength: { value: 5, message: 'CRN deve ter pelo menos 5 caracteres' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="CRN"
                  error={!!errors.crn}
                  helperText={errors.crn?.message}
                  inputProps={{ maxLength: 9 }}
                  InputProps={{
                    startAdornment: <CrnIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                  variant="outlined"
                  placeholder="000000/SP"
                  onChange={(e) => {
                    const formatted = handleCrnChange(e.target.value);
                    setValue('crn', formatted);
                    field.onChange(formatted);
                  }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              endIcon={<CheckIcon />}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Salvando...' : 'Completar cadastro'}
            </Button>

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default CompleteGoogleProfile;
