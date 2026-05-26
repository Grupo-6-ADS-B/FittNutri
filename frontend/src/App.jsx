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
import { useThemeMode } from './contexts/ThemeModeContext';

function isAuthenticated() {
  return Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/gestor" replace />;
  }

  return <Outlet />;
}

function Layout() {
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
        onSwitchToLogin={() => navigate('/login')}
        onSwitchToRegister={() => navigate('/auth')}
        onScrollToReviews={() => navigateAndScroll('reviews')}
        onScrollToContact={() => navigateAndScroll('contact')}
        onBackToHome={() => navigate('/')}
        onScrollToCarousel={() => navigateAndScroll('carousel')}
        onScrollToValues={() => navigateAndScroll('values')}

      />
      <Outlet />
    </>
  );
}

function App() {
  const { mode } = useThemeMode();

  React.useEffect(() => {
    // Restaura dados do usuário ao recarregar a página
    if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
      restoreUserDataFromBackend();
    }
  }, []);

  const theme = React.useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', transition: 'background-color 180ms ease, color 180ms ease' }}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Main />} />

              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/auth" element={<RegisterForm />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/resetar-senha" element={<ResetPassword />} />
              <Route path="/register-patient" element={<PatientRegister />} />
                <Route path="/questionario" element={<QuestionarioStepper />} />
                <Route path="/resumo-circunferencia" element={<ResumoCircunferencia />} />
                <Route path="/gestor" element={<UserGestor />} />
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
