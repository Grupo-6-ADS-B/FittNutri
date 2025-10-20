import { Container, Typography, Box } from '@mui/material';
import { Section } from "./Section";
import { CardValues as Card } from './CardValues';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';

const valores = [
  {
    id: 1,
    title: "Inovação",
    description:
      "Usamos tecnologia e foco no usuário para aprimorar a prática clínica e gerar soluções escaláveis.",
    color: "#2e7d32",
    icon: EmojiObjectsIcon
  },
  {
    id: 2,
    title: "Precisão",
    description:
      "Baseamos decisões em dados confiáveis e métodos consistentes para garantir qualidade e segurança.",
    color: "#1976d2",
    icon: AssessmentIcon
  },
  {
    id: 3,
    title: "Humanização",
    description:
      "Cuidamos com empatia e personalização, respeitando o contexto e as preferências de cada paciente.",
    color: "#8b5cf6",
    icon: FavoriteIcon
  },
  {
    id: 4,
    title: "Eficiência",
    description:
      "Otimizamos processos para reduzir tarefas e permitir foco total no cuidado ao paciente.",
    color: "#f59e0b",
    icon: BoltIcon
  }
];


function Values() {
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