import { Box, Container, Typography, TextField, Button } from '@mui/material';
import { Section } from './Section';
import { useForm, Controller } from 'react-hook-form';

function ContactForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
      <Section background="linear-gradient(135deg, #f8f9fa 0%, #ffffffeb 100%)" py={{ xs: 8, md: 12 }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#1a202c', fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Tem alguma dúvida?
          </Typography>
          <Typography variant="h6" sx={{ color: '#4a5568', maxWidth: '900px', mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}>
            Fale conosco e tire todas as suas dúvidas sobre o nosso software para nutricionistas. Estamos aqui para ajudar você a entender como nossa plataforma pode transformar sua prática clínica e melhorar o atendimento aos seus pacientes.
          </Typography> 
        </Box>
        <Box component="form" sx={{width: 500,  display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mx: 'auto', 
            border: '1px solid #e2e8f0',
            borderRadius: 1,
            backgroundColor: 'white',
            padding: 3,
            alignItems: 'center',
            justifyContent: 'center',
            pt: 2,}} >
            <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nome"
                      sx={{mt: 2}}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      variant="outlined"
                    />
                  )}
                /> 
            <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      rules={{
                        required: 'E-mail é obrigatório',
                        pattern: {
                          value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                          message: 'E-mail inválido'
                        }
                      }}
                      label="E-mail"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      variant="outlined"
                    />
                  )}
                /> 
                  <Controller
            name="message"
            control={control}
            rules={{
              required: 'Mensagem é obrigatória',
              minLength: { value: 10, message: 'Digite pelo menos 10 caracteres' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mensagem"
                placeholder="Escreva sua mensagem..."
                multiline
                minRows={5}
                maxRows={12}
                error={!!errors.message}
                helperText={errors.message?.message}
                variant="outlined"
              />
            )}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button type="submit" variant="contained" color="primary" sx={{ px: 4 }}>
              Enviar
            </Button>
          </Box>
                </Box>
      </Container>
    </Section>
  )
}

export { ContactForm };