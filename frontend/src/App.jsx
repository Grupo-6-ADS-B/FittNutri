import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Header} from './components/Header';
import { AuthPage } from './components/AuthPage';
import { Main } from './components/Main';
import { Footer } from './components/Footer';
import { theme } from './theme';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); 
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSwitchToLogin = () => {
    setIsLoginMode(true);
    setCurrentPage('auth');
  };

  const handleSwitchToRegister = () => {
    setIsLoginMode(false);
    setCurrentPage('auth');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'auth':
        return (
          <AuthPage 
            isLoginMode={isLoginMode}
            onToggleMode={() => setIsLoginMode(!isLoginMode)}
            onBackToHome={handleBackToHome}
          />
        );
      case 'home':
      default:
        return (
          <Main 
            onSwitchToLogin={handleSwitchToLogin}
            onSwitchToRegister={handleSwitchToRegister}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        background: 'linear-gradient(180deg, #ffffff 0%, #C0F4BB 100%)', 
        flexDirection: 'column', 
        minHeight: '100vh'
      }}>
        {currentPage === 'home' ? (
          renderCurrentPage()
        ) : (
          <>
            <Header 
              onSwitchToLogin={handleSwitchToLogin}
              onSwitchToRegister={handleSwitchToRegister}
              onBackToHome={handleBackToHome}
            />
            <Box sx={{ flex: 1 }}>
              {renderCurrentPage()}
            </Box>
          </>
        )}
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export { App };
