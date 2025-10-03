import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="body1" 
          align="center"
          sx={{
            fontWeight: 500
          }}
        >
          FittNutri, software para nutricionistas &copy; {currentYear}
        </Typography>
      </Container>
    </Box>
  );
}

export { Footer };
