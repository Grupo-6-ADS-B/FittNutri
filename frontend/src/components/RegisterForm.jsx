import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Link,
  Stack,
  Grid
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon, 
  CreditCard as CpfIcon,
  Restaurant as CrnIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

function RegisterForm({ onSwitchToLogin }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    const newUserData = {
      nome: data.name,
      email: data.email,
      cpf: data.cpf,
      crn: data.crn,
      senha: data.password,
    };

    try {
      const response = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });

      if (response.status === 409) {
        throw new Error('E-mail, CPF ou CRN já cadastrado.');
      }
      if (!response.ok) {
        throw new Error('Erro ao cadastrar usuário.');
      }

      const responseData = await response.json();
      setSuccess('Cadastro realizado com sucesso!');
   
      onSwitchToLogin(); 

    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao cadastrar. Tente novamente.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Stack spacing={3}>
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
            }
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
          <Grid item xs={12} sm={6} sx={{ pl: 1 }}>
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
            minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="password"
              label="Senha"
              error={!!errors.password}
              helperText={errors.password?.message || 'Mínimo 6 caracteres'}
              InputProps={{
                startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              variant="outlined"
            />
          )}
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
              onClick={onSwitchToLogin}
              sx={{ cursor: 'pointer' }}
            >
              Faça login
            </Link>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default RegisterForm;
