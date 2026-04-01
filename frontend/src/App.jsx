import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
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
  React.useEffect(() => {
    // Restaura dados do usuário ao recarregar a página
    if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
      restoreUserDataFromBackend();
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
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
              </Route>
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
