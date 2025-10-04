import { Container } from  '@mui/material';
import { Header } from "./Header";
import { Hero } from "./Hero";
function Main({ onSwitchToLogin, onSwitchToRegister }) {
  return (
    <>
      <Header 
        onSwitchToLogin={onSwitchToLogin}
        onSwitchToRegister={onSwitchToRegister}
      /> 
      <Container 
        maxWidth="xl" 
        sx={{ 
          width: '100%', 
          mt: { xs: 8, md: 12 }, 
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >  
        <Hero />
      </Container>
    </>
  );
}

export { Main };