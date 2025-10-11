import { Box, Container, Typography } from '@mui/material';
import { Section } from './Section';
import { CardAvaliation } from './CardAvaliation';

const avaliacoes = [
	{
		id: 1,
		title: 'Transformou minha rotina clínica',
		description:
			'A plataforma agilizou meu atendimento e a criação de dietas personalizadas. Os gráficos de evolução e o histórico do paciente tornaram as decisões muito mais rápidas e precisas — recomendo para qualquer nutricionista que queira ganhar tempo e qualidade no atendimento.',
		name: 'Ana Silva',
		date: 'Janeiro 2024',
		avatar: '/avatar1.jpg',
	},
	{
		id: 2,
		title: 'Ferramenta essencial para o consultório',
		description:
			'Organiza prontuários, facilita o planejamento de consultas e gera relatórios profissionais em poucos cliques. Interface intuitiva e suporte ágil — tornou-se parte fundamental do meu fluxo de trabalho.',
		name: 'João Souza',
		date: 'Fevereiro 2024',
		avatar: '/avatar2.jpg',
	},
	{
		id: 3,
		title: 'Aumentou o engajamento dos pacientes',
		description:
			'Com os recursos de acompanhamento e materiais educativos, meus pacientes aderiram melhor às recomendações. A visualização clara do progresso ajuda nas consultas de retorno e melhora os resultados.',
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