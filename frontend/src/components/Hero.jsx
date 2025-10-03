import { Box, Typography, Grid, Button } from  '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function Hero(){
    return (
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
            <Button 
              variant="contained" 
              color="primary"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(46, 125, 50, 0.3)',
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
    )
}

export { Hero };