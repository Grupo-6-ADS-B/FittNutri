import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button,
  Stack
} from '@mui/material';
import logo from '/logo.jpg'; 

function Header({ onSwitchToLogin, onSwitchToRegister, onBackToHome, scrollToCarousel, onScrollToValues }) {
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 2, px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src={logo}
            alt="FittNutri Logo"
            sx={{
              height: 50,
              width: 90,
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <Box>
            <Typography 
              variant="h4" 
              component="div" 
              onClick={onBackToHome}
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main',
                cursor: onBackToHome ? 'pointer' : 'default',
                '&:hover': onBackToHome ? {
                  color: 'primary.dark'
                } : {}
              }}
            >
              FittNutri
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.primary',
                fontSize: '0.85rem'
              }}
            >
              Software para nutricionistas
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button 
            onClick={scrollToCarousel}
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Funcionalidades
            </Typography>
          </Button>
          <Button 
            onClick={onScrollToValues}
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Sobre nós
            </Typography>
          </Button>
          <Button 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Avaliações
          </Typography>
          </Button>
          <Button 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Fale conosco
            </Typography>
          </Button>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={onSwitchToLogin}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              borderWidth: 2,
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                borderWidth: 2,
                transform: 'translateY(-1px)',
              }
            }}
          >
            Entrar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={onSwitchToRegister}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(46, 125, 50, 0.3)',
              }
            }}
          >
            Cadastrar
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export { Header };
