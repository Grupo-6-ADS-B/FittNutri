import React from 'react';
import { Box, Typography, Container, Grid, Link, IconButton, Stack } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#eaf7e9',        
        color: 'text.primary',
        py: { xs: 6, md: 8 },
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/logo.jpg" 
                alt="FittNutri"
                sx={{
                  height: 50,
                  width: 90,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2f1a' }}>
                  FittNutri
                </Typography>
                <Typography variant="body2" sx={{ color: '#2f4f3a' }}>
                  Software para nutricionistas
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#0f2f1a' }}>
              Acesso Rápido
            </Typography>
            <Stack component="nav" spacing={1}>
              <Link href="#carousel" underline="none" sx={{ color: '#214d35' }}>Funcionalidades</Link>
              <Link href="#values" underline="none" sx={{ color: '#214d35' }}>Sobre</Link>
              <Link href="#reviews" underline="none" sx={{ color: '#214d35' }}>Avaliações</Link>
              <Link href="#contact" underline="none" sx={{ color: '#214d35' }}>Fale conosco</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#0f2f1a' }}>
              Contato
            </Typography>
            <Stack spacing={1}>
              <Link href="mailto:suporte@fittnutri.com" underline="none" sx={{ color: '#214d35' }}>suporte@fittnutri.com</Link>
              <Typography variant="body1" sx={{ color: '#214d35' }}>(11) 97645-9906</Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#0f2f1a' }}>
              Social
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="twitter" component="a" href="#" sx={{ bgcolor: 'transparent', color: '#214d35', paddingLeft: 0 }}>
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="instagram" component="a" href="#" sx={{ bgcolor: 'transparent', color: '#214d35' }}>
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="youtube" component="a" href="#" sx={{ bgcolor: 'transparent', color: '#214d35' }}>
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 10, borderTop: '1px solid rgba(0,0,0,0.05)', pt: 3 }}>
          <Typography variant="body2" align="center" sx={{ color: '#245235' }}>
            © {currentYear} FittNutri. Todos os direitos reservados. &nbsp;
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export { Footer };
