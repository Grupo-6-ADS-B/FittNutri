import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="body1" 
          align="center"
          sx={{
            fontWeight: 500,
            color: 'primary.contrastText'
          }}
        >
          FittNutri, software para nutricionistas &copy; {currentYear}
        </Typography>
      </Container>
    </Box>
  );
}

export { Footer };
