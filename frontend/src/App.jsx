import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import Main from './components/Main';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', 
    },
    secondary: {
      main: '#ff6f00', 
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

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
      <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', flexDirection: 'column', minHeight: '100vh' }}>
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

export default App;
