import { Container, Typography, Box } from '@mui/material';
import { Section } from "./Section";
import { CardValues as Card } from './CardValues';
import { useEffect, useState } from 'react';
import api from '../utils/api';

function Values() {
  const [valores, setValores] = useState([]);
  useEffect(() => {
    async function fetchValores() {
      try {
        const response = await api.get('/valores');
        setValores(Array.isArray(response.data) ? response.data : []);
      } catch {
        setValores([]);
      }
    }
    fetchValores();
  }, []);
  return (
    <Section
      backgroundImage="/fundo-frutas.jpg"
      py={{ xs: 6, md: 10 }}
      id="values"
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#1a202c', fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Conheça a nossa missão e valores
          </Typography>
          <Typography variant="h6" sx={{ color: '#4a5568', maxWidth: '900px', mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}>
            Nossa missão é uma plataforma completa e intuitiva que facilite o trabalho de nutricionistas, promovendo mais eficiência no atendimento e saúde de qualidade para todos.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: { xs: 2.5, md: 4 },
            maxWidth: '920px',
            mx: 'auto',
            '&:hover .card-item:not(:hover)': {
              transform: 'scale(0.98)',
              opacity: 0.85,
            },
          }}
        >
          {valores.map(valor => (
            <Box key={valor.id} className="card-item" sx={{ display: 'flex', transition: 'transform 0.28s, opacity 0.28s', borderRadius: 3, transformOrigin: 'center', '&:hover': { zIndex: 10 } }}>
              <Card {...valor} />
            </Box>
          ))}
        </Box>
      </Container>
    </Section>
  );
}

export { Values }