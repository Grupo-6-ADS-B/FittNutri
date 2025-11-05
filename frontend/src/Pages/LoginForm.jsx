import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Link,
  Divider,
  Stack,
  Container,
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Login as LoginIcon,
  Google as GoogleIcon 
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import InstagramIcon from '@mui/icons-material/Instagram';
import api from '../utils/api';

function LoginForm() {
  const navigate = useNavigate();


  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      const { data: body } = await api.post('/users/login', {
        email: data.email,
        senha: data.password,
      });

      const token = body?.token;
      if (token) {
        sessionStorage.setItem('token', token);
      } else {
        console.warn('Token não encontrado na resposta de login.');
      }
      sessionStorage.setItem('nomeUsuario', body?.nome || '');

      const nome = body?.nome;
      setSuccess(`Login realizado com sucesso${nome ? `! Bem-vindo(a), ${nome}` : '!'}`);
      navigate('/gestor');

    } catch (err) {
      let msg = err.response?.data?.message || err.message;
      if (msg.includes('Unexpected end of JSON input')) {
        msg = 'Tente novamente mais tarde.';
      } else if (msg.toLowerCase().includes('user not found')) {
        msg = 'Usuário não encontrado.';
      } else if (msg.toLowerCase().includes('invalid password')) {
        msg = 'Senha inválida.';
      } else if (msg.toLowerCase().includes('network')) {
        msg = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (msg.toLowerCase().includes('failed to fetch')) {
        msg = 'Não foi possível conectar ao servidor. Tente novamente.';
      } else if (err.response?.status === 401) {
        msg = 'Credenciais inválidas. Verifique seu e-mail e senha.';
      }
      setError(msg || 'Ocorreu um erro ao fazer login. Tente novamente.');
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
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Stack spacing={3}>
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
            
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Senha é obrigatória',
                minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                pattern: {
                  value: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/,
                  message: 'Senha deve ter pelo menos 6 caracteres, um número e um caractere especial'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label="Senha"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                  variant="outlined"
                />
              )}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="#" variant="body2">
                Esqueceu a senha?
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              endIcon={<LoginIcon />}
              sx={{ py: 1.5 }}
            >
              Acessar
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
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Faça login com:
              </Typography>
            </Divider>
            
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{ py: 1.5 }}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<InstagramIcon />}
                sx={{ py: 1.5, borderColor: '#E1306C', color: '#E1306C' }}
              >
                Instagram
              </Button>
            </Stack>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Ainda não tem uma conta?{' '}
                <Link 
                  href="#" 
                  onClick={() => navigate('/auth')}
                  sx={{ cursor: 'pointer' }}
                >
                  Cadastre-se
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export { LoginForm };
