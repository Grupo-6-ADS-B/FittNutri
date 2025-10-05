import { Box, Typography, Grid, Button, Container } from  '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Section } from './Section';

function Hero({ onScrollToCarousel, onSwitchToRegister }){
    return (
        <Section 
          background="linear-gradient(135deg, #C0F4BB 0%, #ffffff 100%)"
        >
          <Container maxWidth="xl">
            <Grid container spacing={6} direction="row" alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h2" 
                align="left" 
                sx={{ 
                  mb: 3,
                  background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
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
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: '90%'
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
                onClick={onSwitchToRegister}
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
              
              <Button 
                variant="outlined"
                color="primary"
                size="large"
                onClick={onScrollToCarousel}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  borderWidth: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(46, 125, 50, 0.05)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Ver demonstração
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%)',
                  zIndex: 1,
                }
              }}
            >
              <Box
                component="img"
                src="/fundo.jpg"
                alt="Nutricionista trabalhando"
                sx={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </Box>          
          </Grid>
        </Grid>
          </Container>
        </Section>
    )
}

export { Hero };