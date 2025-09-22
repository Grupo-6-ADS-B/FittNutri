import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Verde para nutrição
    },
    secondary: {
      main: '#ff6f00', // Laranja para destaque
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box sx={{ flex: 1 }}>
          <AuthPage />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
