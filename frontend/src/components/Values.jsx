import { Container, Typography, Box, Grid } from '@mui/material';
import { Section } from "./Section";
import { CardValues as Card } from './CardValues';

const valores = [
  {
    id: 1,
    title: "Inovação",
    description: "Trazer tecnologia que simplifica e potencializa o trabalho do nutricionista, sempre buscando novas formas de melhorar o atendimento.",
    icon: null,
    image: null,
    color: "#f8f9fa"
  },
  {
    id: 2,
    title: "Precisão",
    description: "Garantir dados e relatórios confiáveis para decisões assertivas, baseados na melhor ciência nutricional disponível.",
    icon: null,
    image: null,
    color: "#f8f9fa"
  },
  {
    id: 3,
    title: "Humanização",
    description: "Valorizar o cuidado individual e a jornada de cada paciente, promovendo saúde com empatia e respeito.",
    icon: null,
    image: null,
    color: "#f8f9fa"
  },
  {
    id: 4,
    title: "Eficiência",
    description: "Otimizar processos para que o nutricionista possa focar no que realmente importa: o bem-estar do paciente.",
    icon: null,
    image: null,
    color: "#f8f9fa"
  }
];

function Values() {
return(
     <Section backgroundImage="/fundo-frutas.jpg"  py={{ xs: 8, md: 12 }} data-section="values">
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
            gap: 4,
            maxWidth: '1000px',
            mx: 'auto',
            '&:hover .card-item:not(:hover)': {
              transform: 'scale(0.95)',
              opacity: 0.7
            }
          }}
        >
          {valores.map(valor => (
            <Box
              key={valor.id}
              className="card-item"
              sx={{
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transformOrigin: 'center',
                '&:hover': {
                  transform: 'scale(1.05)',
                  zIndex: 10
                }
              }}
            >
              <Card {...valor} />
            </Box>
          ))}
        </Box>
        </Container>
    </Section>
)
}

export { Values }