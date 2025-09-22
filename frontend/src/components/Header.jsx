import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button,
  Stack
} from '@mui/material';
import logo from '/logo.jpg'; 

function Header() {
  return (
    <AppBar 
      position="static" 
      elevation={2}
      sx={{
        backgroundColor: 'white',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={logo}
            alt="FittNutri Logo"
            sx={{
              height: 50,
              width: 50,
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <Box>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              FittNutri
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              Software para nutricionistas
            </Typography>
          </Box>
        </Box>

        {/* Navigation */}
        <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)'
              }
            }}
          >
            Funcionalidades
          </Button>
          <Button 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)'
              }
            }}
          >
            Sobre
          </Button>
          <Button 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)'
              }
            }}
          >
            Fale conosco
          </Button>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            color="primary"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)'
              }
            }}
          >
            Entrar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            sx={{
              '&:hover': {
                backgroundColor: 'primary.dark'
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

export default Header;
