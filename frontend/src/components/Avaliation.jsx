import { Box, Container, Typography } from '@mui/material';
import { Section } from './Section';
import { CardAvaliation } from './CardAvaliation';

const avaliacoes = [
    {
        id: 1,
        title: "Avaliação 1",
        description: "Descrição da Avaliação 1"
    },
    {
        id: 2,
        title: "Avaliação 2",
        description: "Descrição da Avaliação 2"
    },
    {
        id: 3,
        title: "Avaliação 3",
        description: "Descrição da Avaliação 3"
    }
]

function Avaliation(){

    return(
            <Section background="linear-gradient(135deg, #f8f9fa 0%, #ffffffeb 100%)" py={{ xs: 8, md: 12 }} data-section="carousel">
              <Container maxWidth="xl">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#1a202c', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    Quem usa <Typography component="span" variant="h3" sx={{ color: 'primary.main', fontSize: { xs: '2rem', md: '2.5rem' } }}>recomenda</Typography>
                  </Typography>
                </Box>

                <Box sx={{ position: 'relative', overflow: 'hidden', pt: '20px' }}>
                  <Box sx={{ display: 'flex', transition: 'transform 0.5s ease-in-out', gap: 3, justifyContent: 'space-around'  }}>
                    {avaliacoes.map(func => (
                      <Box key={func.id}>
                        <CardAvaliation {...func} />
                      </Box>
                    ))}
                  </Box>
                </Box>
    
              </Container>
            </Section>
    )
}

export { Avaliation }