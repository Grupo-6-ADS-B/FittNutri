import { Box, Container, Typography } from '@mui/material';
import { Section } from './Section';
import { CardAvaliation } from './CardAvaliation';
import { useEffect, useState } from 'react';
import api from '../utils/api';

function Avaliation() {
	const [avaliacoes, setAvaliacoes] = useState([]);
	useEffect(() => {
		async function fetchAvaliacoes() {
			try {
				const response = await api.get('/avaliacoes');
				setAvaliacoes(Array.isArray(response.data) ? response.data : []);
			} catch {
				setAvaliacoes([]);
			}
		}
		fetchAvaliacoes();
	}, []);

  return (
    <Section
      background="linear-gradient(135deg, #C0F4BB 0%, #ffffffeb 100%)"
      py={{ xs: 8, md: 12 }}
      id="reviews"
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: '#1a202c',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Quem usa{' '}
            <Typography
              component="span"
              variant="h3"
              sx={{
                color: 'primary.main',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              recomenda
            </Typography>
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            pt: '20px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.5s ease-in-out',
              gap: 3,
              justifyContent: 'space-around',
            }}
          >
            {avaliacoes.map((func) => (
              <Box key={func.id}>
                <CardAvaliation {...func} />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Section>
  );
}

export { Avaliation };