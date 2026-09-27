import React from 'react';
import { Box, Typography, Container, Grid, Link, IconButton, Stack } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { alpha, useTheme } from '@mui/material/styles';

function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Funcionalidades', href: '#carousel' },
    { label: 'Sobre', href: '#values' },
    { label: 'Avaliações', href: '#reviews' },
    { label: 'Fale conosco', href: '#contact' },
  ];

  const socialLinks = [
    { label: 'Twitter', icon: TwitterIcon, href: '#' },
    { label: 'Instagram', icon: InstagramIcon, href: '#' },
    { label: 'YouTube', icon: YouTubeIcon, href: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)} 0%, ${theme.palette.background.paper} 100%)`,
        color: theme.palette.text.primary,
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/logo.jpg"
                alt="FittNutri"
                sx={{
                  height: 52,
                  width: 52,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[2],
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  FittNutri
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Software para nutricionistas
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Acesso Rápido
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  underline="none"
                  sx={{ color: theme.palette.text.secondary, width: 'fit-content', '&:hover': { color: theme.palette.primary.main } }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Contato
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                suporte@fittnutri.com
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                (11) 97645-9906
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Redes Sociais
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <IconButton
                    key={social.label}
                    aria-label={social.label}
                    component="a"
                    href={social.href}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
                      color: theme.palette.text.secondary,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.14),
                      },
                    }}
                  >
                    <Icon />
                  </IconButton>
                );
              })}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" align="center" sx={{ color: theme.palette.text.secondary }}>
            © {currentYear} FittNutri. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
