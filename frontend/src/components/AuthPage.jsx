import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Container,
  Typography
} from '@mui/material';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

function AuthPage({ isLoginMode, onToggleMode }) {
  const handleTabChange = (event, newValue) => {
    if ((newValue === 0 && !isLoginMode) || (newValue === 1 && isLoginMode)) {
      onToggleMode();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 5, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
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
          <LoginForm onSwitchToRegister={onToggleMode} />
        ) : (
          <RegisterForm onSwitchToLogin={onToggleMode} />
        )}
      </Paper>
    </Container>
  );
}

export { AuthPage };
