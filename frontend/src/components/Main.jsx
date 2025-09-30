import { Box, Container, Typography, Grid } from  '@mui/material';
import Header from "./Header";
function Main({ onSwitchToLogin, onSwitchToRegister }) {
  return (
    <>
      <Header 
        onSwitchToLogin={onSwitchToLogin}
        onSwitchToRegister={onSwitchToRegister}
      /> 
      <Container sx={{ width: '100%', mt: 20, height: '100vh'}}>  
        <Grid container spacing={4} direction="row" alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" align="left" sx={{ mb: 4 }}>
              Dados precisos, nutrição com propósito
            </Typography>
            <Typography variant="h5" align="left" sx={{ mb: 4 }}>
              Software completo para criar dietas personalizadas, 
              acompanhar a evolução dos pacientes e otimizar sua 
              prática clínica com gráficos avançados e automação inteligente.
            </Typography> 
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src="/fundo.jpg"
              alt="Nutricionista trabalhando"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                objectFit: 'cover',
                display: 'block'
              }}
            />          
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Main;