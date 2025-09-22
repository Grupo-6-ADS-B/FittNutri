import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Container,
  Typography
} from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  const handleTabChange = (event, newValue) => {
    setIsLoginMode(newValue === 0);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={isLoginMode ? 0 : 1} 
            onChange={handleTabChange} 
            centered
            variant="fullWidth"
          >
            <Tab 
              label="Login" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }} 
            />
            <Tab 
              label="Cadastro" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }} 
            />
          </Tabs>
        </Box>
        
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          sx={{ 
            mb: 2, 
            color: 'primary.main',
            fontWeight: 'bold'
          }}
        >
          {isLoginMode ? 'Bem-vindo de volta!' : 'Junte-se a nós!'}
        </Typography>
        
        <Typography 
          variant="body1" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          {isLoginMode 
            ? 'Faça login para acessar sua conta' 
            : 'Crie sua conta para começar'
          }
        </Typography>
        
        {isLoginMode ? (
          <LoginForm onSwitchToRegister={handleToggleMode} />
        ) : (
          <RegisterForm onSwitchToLogin={handleToggleMode} />
        )}
      </Paper>
    </Container>
  );
}

export default AuthPage;
