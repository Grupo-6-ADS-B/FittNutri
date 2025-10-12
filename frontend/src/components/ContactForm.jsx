import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';
import { Section } from './Section';
import { useForm, Controller } from 'react-hook-form';

function ContactForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      console.log(data);
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <Section background="linear-gradient(135deg, #f8f9fa 0%, #ffffffeb 100%)" id="contact" py={{ xs: 6, md: 10 }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#1a202c', fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Tem alguma dúvida?
          </Typography>
          <Typography variant="h6" sx={{ color: '#4a5568', maxWidth: '900px', mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}>
            Fale conosco e tire todas as suas dúvidas sobre o nosso software para nutricionistas. Estamos aqui para ajudar você a entender como nossa plataforma pode transformar sua prática clínica e melhorar o atendimento aos seus pacientes.
          </Typography> 
        </Box>

        <Paper
          elevation={1}
          sx={{
            maxWidth: 560,
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(14,30,37,0.06)'
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nome"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  variant="outlined"
                  inputProps={{ 'aria-label': 'nome' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.12)' },
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main', boxShadow: '0 0 0 6px rgba(46,125,50,0.06)' }
                    }
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{ required: 'E‑mail é obrigatório', pattern: { value: /^\S+@\S+\.\S+$/, message: 'E‑mail inválido' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="E-mail"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  variant="outlined"
                  inputProps={{ 'aria-label': 'email' }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              )}
            />

            <Controller
              name="message"
              control={control}
              rules={{ required: 'Mensagem é obrigatória', minLength: { value: 10, message: 'Digite ao menos 10 caracteres' } }}
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
                  inputProps={{ 'aria-label': 'mensagem' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.12)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main', boxShadow: '0 0 0 6px rgba(46,125,50,0.06)' }
                    }
                  }}
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button type="submit" variant="contained" color="primary" sx={{ px: 4 }} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Section>
  );
}

export { ContactForm };