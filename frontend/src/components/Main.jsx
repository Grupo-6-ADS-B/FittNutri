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
      <Container sx={{ width: '100%', mt: 20, height: '100vh'}}>  
        <Hero />
      </Container>
    </>
  );
}

export { Main };