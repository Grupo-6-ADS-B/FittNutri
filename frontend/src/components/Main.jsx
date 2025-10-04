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
      <Hero />
    </>
  );
}

export { Main };