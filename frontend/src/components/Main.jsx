import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import Header from "./Header";

function Main() {
  return (
    <>
      <Header  />
      <Container>
        <Typography variant="h1">Bem-vindo ao FittNutri!</Typography>
        <Typography variant="h5">Software para nutricionistas</Typography>
        <Button>Começar agora</Button>
        
        {/* Seção de funcionalidades */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3">Funcionalidades</Typography>
          {/* Cards, imagens, textos, etc. */}
        </Box>
        
        {/* Seção sobre */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3">Sobre nós</Typography>
          {/* Mais conteúdo estático */}
        </Box>
      </Container>
      <Footer />
    </>
  );
}

export default Main;