import { Box, Typography, Grid, Button, Container } from  '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Section } from './Section';
import { useNavigate } from 'react-router-dom';

function Hero({ onScrollToCarousel, onSwitchToRegister }){
  const navigate = useNavigate();
    return (
        <Section 
          backgroundImage="/fundo-nutri.png" overlay='rgba(0, 0, 0, 0.7)' overlayOpacity={0.9}
        >
          <Container maxWidth="xl">
            <Grid container  direction="row" alignItems="center" sx={{padding: '20px'}}>
          <Grid item xs={12} md={12}>
            <Box sx={{ mb: 3,  }}>
              <Typography 
                variant="h2" 
                align="left" 
                sx={{ 
                  mb: 3,
                  color: 'secondary.contrastText',
                  fontWeight: 700,
                }}
              >
                Dados precisos, nutrição com propósito
              </Typography>
            </Box>
            <Typography 
              variant="h5" 
              align="left" 
              sx={{ 
                mb: 5,
                color: 'secondary.contrastText',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: '60%'
              }}
            >
              Software completo para criar dietas personalizadas, 
              acompanhar a evolução dos pacientes e otimizar sua 
              prática clínica com gráficos avançados e automação inteligente.
            </Typography> 
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="primary"
                endIcon={<ArrowForwardIcon />}
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  py: 2,
                  px: 5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
                  boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(46, 125, 50, 0.4)',
                    '& .MuiSvgIcon-root': {
                      transform: 'translateX(4px)',
                    }
                  },
                  '& .MuiSvgIcon-root': {
                    transition: 'transform 0.3s ease',
                  }
                }}
              >
                Conheça o nosso software
              </Button>
            </Box>
          </Grid>      
        </Grid>
          </Container>
        </Section>
    )
}

export { Hero };