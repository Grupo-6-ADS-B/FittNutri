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
  Stack
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Login as LoginIcon,
  Google as GoogleIcon 
} from '@mui/icons-material';
import InstagramIcon from '@mui/icons-material/Instagram';
function LoginForm({ onSwitchToRegister }) {
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
      const response = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, senha: data.password }),
      });

      if (response.status === 401) {
        const msg = await response.text();
        throw new Error(msg);
      }
      if (!response.ok) {
        throw new Error('Erro ao autenticar usuário.');
      }

      const user = await response.json();
      setSuccess(`Login realizado com sucesso! Bem-vindo(a), ${user.nome}!`);

    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao fazer login. Tente novamente.');
    }
  };

  return (
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
              onClick={onSwitchToRegister}
              sx={{ cursor: 'pointer' }}
            >
              Cadastre-se
            </Link>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export { LoginForm };
