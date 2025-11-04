import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import {LoginForm} from './components/LoginForm';
import {RegisterForm} from './components/RegisterForm';
// pages/components
import { Header } from './components/Header';
import { Main } from './components/Main';
import UserGestor from "./components/UserGestor";
import UserRegister from "./components/UserRegister";
import QuestionarioStepper from "./components/QuestionarioStepper";
import ResumoCircunferencia from "./components/ResumoCircunferencia";

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Main />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/auth" element={<RegisterForm />} />
              <Route path="/register" element={<UserRegister />} />
              <Route path="/questionario" element={<QuestionarioStepper />} />
              <Route path="/resumo-circunferencia" element={<ResumoCircunferencia />} />
              <Route path="/gestor" element={<UserGestor />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
