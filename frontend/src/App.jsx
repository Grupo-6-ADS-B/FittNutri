import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { lightTheme } from './theme/lightTheme';
import { darkTheme } from './theme/darkTheme';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet, Navigate, useLocation } from "react-router-dom";
import { LoginForm } from './Pages/LoginForm';
import { RegisterForm } from './Pages/RegisterForm';
import ResetPassword from './Pages/ResetPassword';
import { Header } from './components/Header';
import { Main } from './Pages/Main';
import UserGestor from "./Pages/UserGestor";
import QuestionarioStepper from "./Pages/QuestionarioStepper";
import ResumoCircunferencia from "./Pages/ResumoCircunferencia";
import Diet from "./Pages/Diet";
import Dashboard from "./Pages/Dashboard";
import PatientRegister from './Pages/PatientRegister';
import { restoreUserDataFromBackend } from './utils/userDataRestorer';
import Profile from './Pages/Profile';
import EditProfile from './Pages/EditProfile';
import Settings from './Pages/Settings';
import ChangePassword from './Pages/ChangePassword';
import CompleteGoogleProfile from './Pages/CompleteGoogleProfile';
import { useThemeMode } from './contexts/ThemeModeContext';

function isAuthenticated() {
  return Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

function isProfileComplete() {
  const val = sessionStorage.getItem('perfilCompleto') ?? localStorage.getItem('perfilCompleto');
  return val !== 'false';
}

// Redireciona usuários autenticados que tentam acessar rotas públicas exclusivas
function PublicOnlyRoute() {
  if (isAuthenticated()) return <Navigate to="/gestor" replace />;
  return <Outlet />;
}

// Redireciona usuários não autenticados; redireciona para /completar-perfil se perfil incompleto
function ProtectedRoute() {
  const location = useLocation();
  if (!isAuthenticated()) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isProfileComplete()) return <Navigate to="/completar-perfil" replace />;
  return <Outlet />;
}

// Acessível apenas quando autenticado E perfil ainda incompleto
function CompleteProfileRoute() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (isProfileComplete()) return <Navigate to="/gestor" replace />;
  return <Outlet />;
}

// Redireciona usuários autenticados que chegam na home para o gestor
function AuthRedirect() {
  if (isAuthenticated()) return <Navigate to="/gestor" replace />;
  return <Main />;
}

// Layout para páginas públicas: home, login, cadastro, resetar-senha
function PublicLayout() {
  const navigate = useNavigate();

  const navigateAndScroll = (section) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(`[id="${section}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
    } else {
      const el = document.querySelector(`[id="${section}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Header
        isPublic
        onSwitchToLogin={() => navigate('/login')}
        onSwitchToRegister={() => navigate('/auth')}
        onScrollToCarousel={() => navigateAndScroll('carousel')}
        onScrollToValues={() => navigateAndScroll('values')}
        onScrollToReviews={() => navigateAndScroll('reviews')}
        onScrollToContact={() => navigateAndScroll('contact')}
      />
      <Outlet />
    </>
  );
}

// Layout para páginas privadas: gestor, perfil, configurações, etc.
function PrivateLayout() {
  return (
    <>
      <Header isPublic={false} />
      <Outlet />
    </>
  );
}

function App() {
  const { mode } = useThemeMode();

  React.useEffect(() => {
    if (isAuthenticated()) restoreUserDataFromBackend();
  }, []);

  const theme = React.useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', transition: 'background-color 180ms ease, color 180ms ease' }}>
          <Routes>
            {/* Rotas públicas */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<AuthRedirect />} />
              <Route path="/resetar-senha" element={<ResetPassword />} />
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/auth" element={<RegisterForm />} />
              </Route>
            </Route>

            {/* Rotas privadas */}
            <Route element={<PrivateLayout />}>
              {/* Completar perfil Google — acessível apenas com perfil incompleto */}
              <Route element={<CompleteProfileRoute />}>
                <Route path="/completar-perfil" element={<CompleteGoogleProfile />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/gestor" element={<UserGestor />} />
                <Route path="/register-patient" element={<PatientRegister />} />
                <Route path="/questionario" element={<QuestionarioStepper />} />
                <Route path="/resumo-circunferencia" element={<ResumoCircunferencia />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/diet" element={<Diet />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/password" element={<ChangePassword />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
