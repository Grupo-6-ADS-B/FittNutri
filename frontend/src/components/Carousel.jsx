import { Section } from "./Section";
import { Card } from "./Card";
import { Container, Typography, Box, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import {
  RestaurantMenu as DietIcon,
  TrendingUp as ProgressIcon,
  Assessment as ReportsIcon,
  Schedule as PlanningIcon,
  People as PatientsIcon,
  TableChart as TacoIcon,
  ArrowBackIos,
  ArrowForwardIos
} from '@mui/icons-material';

const funcionalidades = [
  { id: 1, title: "Dietas Personalizadas", description: "Crie planos alimentares únicos baseados nas necessidades específicas de cada paciente com banco de alimentos completo e cálculos nutricionais automáticos.", icon: DietIcon, image: "/dieta.jpg", color: 'primary' },
  { id: 2, title: "Acompanhamento da Evolução", description: "Monitore o progresso dos seus pacientes com gráficos detalhados, métricas de evolução em tempo real.", icon: ProgressIcon, image: "/nutri-paciente.jpg", color: 'secondary' },
  { id: 3, title: "Relatórios Avançados", description: "Gere relatórios profissionais com análises nutricionais completas, recomendações personalizadas e exportação em PDF.", icon: ReportsIcon, image: "/relatorios.png", color: 'primary' },
  { id: 4, title: "Agendamento Pessoal", description: "Cadastre e organize sua agenda de consultas de forma simples e prática, com controle total dos seus horários e disponibilidade.", icon: PlanningIcon, image: "/agendamento.jpg", color: 'secondary' },
  { id: 5, title: "Gestão de Pacientes", description: "Centralize todas as informações dos pacientes com histórico completo, fichas nutricionais e acesso rápido aos dados importantes.", icon: PatientsIcon, image: "/nutri-paciente2.jpg", color: 'primary' },
  { id: 6, title: "Tabela TACO Integrada", description: "Acesso completo à Tabela Brasileira de Composição de Alimentos com dados nutricionais precisos de mais de 600 alimentos nacionais.", icon: TacoIcon, image: "/piramide.jpg", color: 'secondary' }
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(getCardsToShow());

  function getCardsToShow() {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 600) return 1;
      if (window.innerWidth < 960) return 2;
    }
    return 3;
  }

  useEffect(() => {
    const handleResize = () => setCardsToShow(getCardsToShow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = funcionalidades.length - cardsToShow;

  const nextSlide = () => setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));

  const iconButtonStyles = {
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    width: 50,
    height: 50,
    '&:hover:not(:disabled)': { backgroundColor: 'primary.main', color: 'white', transform: 'scale(1.1)' },
    '&:disabled': { backgroundColor: 'rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.3)', boxShadow: 'none' },
    transition: 'all 0.3s ease',
  };

  return (
    <Section background="linear-gradient(135deg, #f8f9fa 0%, #ffffffeb 100%)" py={{ xs: 8, md: 12 }} data-section="carousel">
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#1a202c', fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Tudo que você precisa <Typography component="span" variant="h3" sx={{ color: 'primary.main' }}>em um só lugar</Typography>
          </Typography>
          <Typography variant="h6" sx={{ color: '#4a5568', maxWidth: '900px', mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}>
            Desde a criação de dietas personalizadas até o acompanhamento detalhado da evolução dos pacientes, oferecemos as melhores ferramentas para otimizar a sua performance no consultório
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', transition: 'transform 0.5s ease-in-out', transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`, gap: 3 }}>
            {funcionalidades.map(func => (
              <Box key={func.id} sx={{ flex: `0 0 calc(${100 / cardsToShow}% - 16px)`, display: 'flex', justifyContent: 'center' }}>
                <Card {...func} />
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
          <IconButton onClick={prevSlide} disabled={currentIndex === 0} sx={iconButtonStyles}>
            <ArrowBackIos sx={{ ml: 0.5, fontSize: '1.4rem' }} />
          </IconButton>
          <IconButton onClick={nextSlide} disabled={currentIndex === maxIndex} sx={iconButtonStyles}>
            <ArrowForwardIos sx={{ fontSize: '1.4rem' }} />
          </IconButton>
        </Box>
      </Container>
    </Section>
  );
}

export { Carousel };
