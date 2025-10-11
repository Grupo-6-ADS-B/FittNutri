import { Box, Container, Typography } from '@mui/material';
import { Section } from './Section';
import { CardAvaliation } from './CardAvaliation';

const avaliacoes = [
  {
    id: 1,
    title: 'Transformou minha rotina clínica',
    description:
      'A plataforma agilizou meus atendimentos e a criação de dietas. Os gráficos e históricos tornaram as decisões mais rápidas e precisas. Recomendo a qualquer nutricionista.',
    name: 'Ana Silva',
    date: 'Janeiro 2024',
    avatar: '/avatar1.jpg',
  },
  {
    id: 2,
    title: 'Ferramenta essencial!',
    description:
      'Organiza prontuários, facilita consultas e gera relatórios em poucos cliques. Interface intuitiva e suporte ágil — virou parte do meu dia a dia.',
    name: 'João Souza',
    date: 'Fevereiro 2024',
    avatar: '/avatar2.jpg',
  },
  {
    id: 3,
    title: 'Aumentou o engajamento',
    description:
      'Os recursos de acompanhamento e materiais educativos melhoraram a adesão dos pacientes e os resultados nas consultas de retorno.',
    name: 'Maria Oliveira',
    date: 'Março 2024',
    avatar: '/avatar3.jpg',
  },
];

function Avaliation() {
	return (
		<Section
			background="linear-gradient(135deg, #C0F4BB 0%, #ffffffeb 100%)"
			py={{ xs: 8, md: 12 }}
			data-section="carousel"
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