import { Box, Typography, Grid, Button, Container } from  '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha, useTheme } from '@mui/material/styles';
import { Section } from './Section';
import { useNavigate } from 'react-router-dom';

function Hero(){
  const theme = useTheme();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'));
    return (
        <Section 
          backgroundImage="/fundo-nutri.png"
           overlay={theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.78)' : 'rgba(0, 0, 0, 0.56)'} overlayOpacity={theme.palette.mode === 'dark' ? 0.82 : 0.62}
        >
          <Container maxWidth="xl">
            <Grid container  direction="row" alignItems="center" sx={{padding: '20px'}}>
          <Grid item xs={12} md={12}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h2" 
                align="left" 
                sx={{ 
                  mb: 3,
                  color: theme.palette.mode === 'dark' ? theme.palette.grey[50] : theme.palette.common.white,
                  fontWeight: 700,
                  textShadow: theme.palette.mode === 'dark' ? '0 2px 24px rgba(0,0,0,0.55)' : '0 2px 16px rgba(0,0,0,0.35)',
                  maxWidth: '12ch',
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
                color: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[50], 0.88) : alpha(theme.palette.common.white, 0.92),
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: { xs: '100%', md: '60%' },
                textShadow: theme.palette.mode === 'dark' ? '0 1px 18px rgba(0,0,0,0.45)' : '0 1px 12px rgba(0,0,0,0.28)',
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
                onClick={() => navigate(isLoggedIn ? '/gestor' : '/auth')}
                sx={{
                  py: 2,
                  px: 5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  textTransform: 'none',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #69d26d 0%, #2f8f39 100%)'
                    : 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
                  color: theme.palette.mode === 'dark' ? '#051107' : theme.palette.primary.contrastText,
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.35)'
                    : '0 4px 15px rgba(46, 125, 50, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #7ee381 0%, #46a251 100%)'
                      : 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 14px 32px rgba(0,0,0,0.42)'
                      : '0 12px 35px rgba(46, 125, 50, 0.4)',
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