import { Box, Container, Typography } from '@mui/material';
import Header from "./Header";

function Main({ onSwitchToLogin, onSwitchToRegister }) {
  return (
    <>
      <Header 
        onSwitchToLogin={onSwitchToLogin}
        onSwitchToRegister={onSwitchToRegister}
      />
      <Container maxWidth="lg" sx={{ py: 8 }}>      
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" align="center" sx={{ mb: 4 }}>
            Funcionalidades
          </Typography>
        </Box>
        
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" align="center" sx={{ mb: 4 }}>
            Sobre nós
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default Main;