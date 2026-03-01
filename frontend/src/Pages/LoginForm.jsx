import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
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
  Login as LoginIcon
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import api from '../utils/api';


function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Google Client ID
  const googleClientId = '857800617390-jioede29n3luve0u0svvp2mnfatu35j0.apps.googleusercontent.com';

  // Recupera email/senha do sessionStorage se existirem
  const emailSession = sessionStorage.getItem('emailUsuario') || '';
  const senhaSession = sessionStorage.getItem('senhaUsuario') || '';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      email: emailSession,
      password: senhaSession
    }
  });

  // Limpa email/senha do sessionStorage após preencher
  useState(() => {
    if (emailSession) sessionStorage.removeItem('emailUsuario');
    if (senhaSession) sessionStorage.removeItem('senhaUsuario');
  }, []);

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    
    
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    
    try {
      const { data: body } = await api.post('/users/login', {
        email: data.email,
        senha: data.password,
      });
      const token = body?.token;
      if (token) {
        sessionStorage.setItem('token', token);
        localStorage.setItem('token', token);
      } else {
        console.warn('Token não encontrado na resposta de login.');
      }
      if (body?.id) {
        sessionStorage.setItem('idUsuario', body.id);
        localStorage.setItem('idUsuario', body.id);
      }
      if (body?.nome) {
        sessionStorage.setItem('nomeUsuario', body.nome);
        localStorage.setItem('nomeUsuario', body.nome);
      }
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

  // Função de login com Google
  const handleGoogleLogin = async (credentialResponse) => {
    console.log('Google credentialResponse:', credentialResponse);
    setError('');
    setSuccess('');
    let decoded;
    try {
      decoded = jwtDecode(credentialResponse.credential);
      console.log('Google decoded:', decoded);
    } catch (decodeErr) {
      console.error('Erro ao decodificar JWT do Google:', decodeErr);
      setError('Erro ao decodificar dados do Google.');
      return;
    }
    try {
      // Salva nome e foto do Google
      sessionStorage.setItem('token', credentialResponse.credential);
      localStorage.setItem('token', credentialResponse.credential);
      sessionStorage.setItem('nomeUsuario', decoded.name || 'Google User');
      localStorage.setItem('nomeUsuario', decoded.name || 'Google User');
      if (decoded.picture) {
        sessionStorage.setItem('fotoUsuario', decoded.picture);
        localStorage.setItem('fotoUsuario', decoded.picture);
      }
      // Envia para o backend para salvar no banco
      console.log('Enviando para backend /users/google-login:', {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        sub: decoded.sub,
        token: credentialResponse.credential
      });
      await api.post('/users/google-login', {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        sub: decoded.sub,
        token: credentialResponse.credential
      });
      setSuccess(`Login Google realizado com sucesso! Bem-vindo(a), ${decoded.name || ''}`);
      navigate('/gestor');
    } catch (err) {
      console.error('Erro ao salvar usuário Google ou redirecionar:', err);
      setError('Erro ao autenticar com o Google.');
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');
    if (!recoveryEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
      setRecoveryError('Digite um e-mail válido.');
      return;
    }
    // Simula envio de email
    setTimeout(() => {
      setRecoverySuccess(`Um email para redefinir sua senha foi enviado para ${recoveryEmail}.`);
    }, 1000);
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

      <GoogleOAuthProvider clientId={googleClientId}>
      <Container sx={{ position: 'relative', zIndex: 2, maxWidth: '500px !important', border: '1px solid #ddd', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', backgroundColor: 'rgba(255,255,255,0.96)' }}>
        {!showRecovery ? (
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
                <Link href="#" variant="body2" onClick={() => setShowRecovery(true)} sx={{ cursor: 'pointer' }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError('Erro ao autenticar com o Google.')}
                  width="100%"
                  shape="pill"
                  text="signin_with"
                  locale="pt-BR"
                  render={renderProps => (
                    <Button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      variant="outlined"
                      sx={{
                        py: 2,
                        px: 4,
                        borderColor: '#2e7d32', // verde do tema
                        color: '#2e7d32',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderRadius: '30px',
                        boxShadow: '0 2px 8px rgba(46,125,50,0.08)',
                        minWidth: 260,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        '&:hover': {
                          borderColor: '#1b5e20',
                          background: 'rgba(46,125,50,0.04)'
                        }
                      }}
                      fullWidth={false}
                      startIcon={
                        <svg width="28" height="28" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
                          <g>
                            <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6-6C36.1 5.1 30.4 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.3-3.5z"/>
                            <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.3 16.1 18.8 13 24 13c2.7 0 5.2.9 7.2 2.4l6-6C36.1 5.1 30.4 3 24 3 16.1 3 9.1 7.6 6.3 14.7z"/>
                            <path fill="#FBBC05" d="M24 43c5.4 0 10-1.8 13.3-4.9l-6.2-5.1c-2 1.4-4.5 2.2-7.1 2.2-5.6 0-10.3-3.7-12-8.7l-6.5 5c3.1 6.2 9.7 10.5 18.5 10.5z"/>
                            <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-4.1 5.1-7.3 5.1-2.1 0-4-.7-5.5-2l-6.5 5C18.1 41.2 20.9 43 24 43c8.8 0 15.4-4.3 18.5-10.5z"/>
                          </g>
                        </svg>
                      }
                    >
                      Entrar com Google
                    </Button>
                  )}
                />
              </Box>
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
        ) : (
          <Box component="form" onSubmit={handleRecovery} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Recuperação de Senha
              </Typography>
              <TextField
                fullWidth
                type="email"
                label="Digite seu email para recuperação"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
                variant="outlined"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ py: 1.5 }}
              >
                Confirmar
              </Button>
              {recoveryError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {recoveryError}
                </Alert>
              )}
              {recoverySuccess && (
                <Alert severity="success" sx={{ mt: 2, color: 'green' }}>
                  {recoverySuccess}
                </Alert>
              )}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link href="#" variant="body2" onClick={() => setShowRecovery(false)} sx={{ cursor: 'pointer' }}>
                  Voltar para login
                </Link>
              </Box>
            </Stack>
          </Box>
        )}
      </Container>
      </GoogleOAuthProvider>
    </Box>
  );
}

export { LoginForm };
