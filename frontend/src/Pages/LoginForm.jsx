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
import { alpha, useTheme } from '@mui/material/styles';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from "react-router-dom";
import InstagramIcon from '@mui/icons-material/Instagram';
import api from '../utils/api';


function LoginForm() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const from = location.state?.from?.pathname || '/gestor';

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '654251176082-2bbn9dp6vhee4o2efkmc8t73q8ga8t7g.apps.googleusercontent.com';

  // Recupera email do sessionStorage se existir
  const emailSession = sessionStorage.getItem('emailUsuario') || '';

  const {
    control,
    handleSubmit,
    clearErrors,
    setError: setFieldError,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: emailSession,
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    clearErrors();
    
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
      navigate(from, { replace: true });
    } catch (err) {
       const responseData = err.response?.data;
      const rawMessage = typeof responseData === 'string'
        ? responseData
        : responseData?.message || responseData?.error || responseData?.title || err.message || '';
      const msg = rawMessage.toLowerCase();

      if (msg.includes('unexpected end of json input')) {
        setError('Tente novamente mais tarde.');
        return;
      }

      if (msg.includes('user not found') || msg.includes('email do usuário não encontrado') || msg.includes('email não encontrado')) {
        setFieldError('email', { type: 'server', message: 'Email não encontrado.' });
        setError('Confira o e-mail informado.');
        return;
      }

      if (msg.includes('invalid password') || msg.includes('senha incorreta') || msg.includes('password')) {
        setFieldError('password', { type: 'server', message: 'Senha incorreta.' });
        setError('Confira a senha informada.');
        return;
      }

      if (msg.includes('credenciais inválidas') || msg.includes('credenciais invalidas') || err.response?.status === 401) {
        setFieldError('password', { type: 'server', message: 'E-mail ou senha incorretos.' });
        setError('Verifique seu e-mail e senha.');
        return;
      }

      if (msg.includes('network') || msg.includes('failed to fetch')) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
        return;
      }

      setError(rawMessage || 'Ocorreu um erro ao fazer login. Tente novamente.');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setError('');
    setSuccess('');
    let decoded;
    try {
      decoded = jwtDecode(credentialResponse.credential);
    } catch (decodeErr) {
      console.error('Erro ao decodificar JWT do Google:', decodeErr);
      setError('Erro ao decodificar dados do Google.');
      return;
    }
    try {
      const photoUrl = decoded.picture || '';

      const response = await api.post('/users/google-login', {
        name: decoded.name,
        email: decoded.email,
        picture: photoUrl,
        sub: decoded.sub,
        token: credentialResponse.credential
      });

      // Armazena o JWT emitido pelo backend (não o credential do Google)
      const backendToken = response.data.token;
      const userName = response.data.nome || decoded.name || 'Google User';
      const foto = response.data.foto || photoUrl;
      const userId = response.data.id;
      const perfilCompleto = response.data.perfilCompleto !== false;

      sessionStorage.setItem('token', backendToken);
      localStorage.setItem('token', backendToken);
      sessionStorage.setItem('nomeUsuario', userName);
      localStorage.setItem('nomeUsuario', userName);
      sessionStorage.setItem('perfilCompleto', perfilCompleto ? 'true' : 'false');
      localStorage.setItem('perfilCompleto', perfilCompleto ? 'true' : 'false');
      if (foto) {
        sessionStorage.setItem('fotoUsuario', foto);
        localStorage.setItem('fotoUsuario', foto);
      }
      if (userId) {
        sessionStorage.setItem('idUsuario', String(userId));
        localStorage.setItem('idUsuario', String(userId));
      }

      setSuccess(`Login Google realizado com sucesso! Bem-vindo(a), ${userName}`);
      setTimeout(() => {
        navigate(perfilCompleto ? '/gestor' : '/completar-perfil', { replace: true });
      }, 500);
    } catch (err) {
      console.error('Erro ao autenticar com Google:', err);
      setError('Erro ao autenticar com o Google. ' + (err.response?.data?.error || err.message));
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
    try {
      const { data } = await api.post('/users/recover-password', { email: recoveryEmail });
      setRecoverySuccess('Um email para redefinir sua senha foi enviado para ' + recoveryEmail + '.');
    } catch (err) {
      let msg = err.response?.data?.error || err.message;
      if (err.response?.status === 404) {
        msg = 'E-mail não encontrado.';
      }
      setRecoveryError(msg || 'Erro ao enviar e-mail de recuperação.');
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
          background: theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.72)' : 'rgba(0,0,0,0.28)',
          zIndex: 0,
          backdropFilter: 'blur(4px)',
        }}
      />

      <GoogleOAuthProvider clientId={googleClientId}>
        <Container sx={{ position: 'relative', zIndex: 2, maxWidth: '500px !important', border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', padding: '24px', boxShadow: theme.shadows[3], backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 0.96), color: theme.palette.text.primary }}>
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
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.16 : 0.96),
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        borderRadius: '30px',
                        boxShadow: theme.shadows[1],
                        minWidth: 260,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          background: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.06),
                          boxShadow: theme.shadows[2],
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${theme.palette.primary.main}`,
                          outlineOffset: 2,
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
