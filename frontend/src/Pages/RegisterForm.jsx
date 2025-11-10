import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Link,
  Stack,
  Container,
  Grid
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon, 
  CreditCard as CpfIcon,
  MedicalInformation as CrnIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import api from '../utils/api';


function RegisterForm({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      crn: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

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
    v = v.replace(/(\d{1,6})([A-Za-z]{0,2})/, (m, n, uf) => uf ? n + '/' + uf.toUpperCase() : n);
    return v;
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    const payload = {
      nome: data.name,
      email: data.email,
      cpf: data.cpf,
      crn: data.crn,
      senha: data.password
    };

    try {
      const resp = await api.post('/users', payload);
      setSuccess(resp.data?.message ?? 'Cadastro realizado com sucesso.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 400) {
        setError(msg ?? 'Requisição inválida. Verifique os dados.');
      } else if (status === 409) {
        setError(msg ?? 'Registro duplicado (CPF/Email já cadastrado).');
      } else {
        setError(msg ?? `Erro ao cadastrar (status ${status ?? 'desconhecido'}).`);
      }
    }
  };

  return (
    <Box component="main"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 160px)',
        py: { xs: 4, md: 8 },
        px: 2,
        height: '90vh',
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
      <Container sx={{ position: 'relative', zIndex: 2, maxWidth: '600px !important', backgroundColor: 'rgba(255,255,255,0.96)', p: 3, borderRadius: 0.5, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Box id="register-form" component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {/* Todos os Controllers e campos do formulário */}
            <Controller
              name="name"
              control={control}
              rules={{
                required: 'Nome é obrigatório',
                minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nome"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'E-mail é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'E-mail inválido'
                },
                validate: value =>
                  value.toLowerCase().endsWith('.com') || 'O e-mail deve terminar com ".com"'
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="email"
                  label="Email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                  variant="outlined"
                />
              )}
            />
            <Grid container spacing={2} sx={{ '& .MuiGrid-item': { paddingLeft: '0 !important' } }}>
              <Grid item xs={12} sm={6} sx={{ pr: 1 }}>
                <Controller
                  name="cpf"
                  control={control}
                  rules={{
                    required: 'CPF é obrigatório',
                    minLength: { value: 14, message: 'CPF deve estar completo' }
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
              </Grid>
              <Grid item xs={12} sm={6} sx={{ pl: 1, pr: 2 }}>
                <Controller
                  name="crn"
                  control={control}
                  rules={{
                    required: 'CRN é obrigatório',
                    minLength: { value: 6, message: 'CRN deve ter pelo menos 6 caracteres' }
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
              </Grid>
            </Grid>
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Senha é obrigatória',
                validate: value => {
                  const requisitos = [];
                  if (!value || value.length < 8) requisitos.push('mínimo 8 caracteres');
                  if (!/[A-Z]/.test(value)) requisitos.push('uma letra maiúscula');
                  if (!/[0-9]/.test(value)) requisitos.push('um número');
                  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) requisitos.push('um caractere especial');
                  return requisitos.length === 0 || `A senha precisa de: ${requisitos.join(', ')}`;
                }
              }}
              render={({ field, fieldState }) => {
                const requisitos = [];
                if (!field.value || field.value.length < 8) requisitos.push('mínimo 8 caracteres');
                if (!/[A-Z]/.test(field.value)) requisitos.push('uma letra maiúscula');
                if (!/[0-9]/.test(field.value)) requisitos.push('um número');
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(field.value)) requisitos.push('um caractere especial');
                const senhaValida = requisitos.length === 0;
                return (
                  <TextField
                    {...field}
                    fullWidth
                    type="password"
                    label="Senha"
                    error={passwordTouched && !senhaValida}
                    helperText={passwordTouched && !senhaValida ? `A senha precisa de: ${requisitos.join(', ')}` : ''}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />, 
                    }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: passwordTouched && !senhaValida ? 'error.main' : undefined },
                      },
                      '& .MuiFormHelperText-root': {
                        color: passwordTouched && !senhaValida ? 'error.main' : undefined,
                      }
                    }}
                    onChange={e => {
                      field.onChange(e);
                      if (!passwordTouched) setPasswordTouched(true);
                    }}
                  />
                );
              }}
            />
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Confirmação de senha é obrigatória',
                validate: value => value === password || 'As senhas não coincidem'
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label="Confirmar Senha"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                  variant="outlined"
                />
              )}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              endIcon={<PersonAddIcon />}
              sx={{ py: 1.5 }}
            >
              Cadastre-se
            </Button>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Já tem uma conta?{' '}
                <Link 
                  href="#" 
                  onClick={() => navigate('/login')}
                  sx={{ cursor: 'pointer' }}
                >
                  Faça login
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export { RegisterForm };
