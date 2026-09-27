import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { CheckCircleOutline as CheckIcon, SendOutlined as SendIcon } from '@mui/icons-material';
import { Section } from './Section';
import { useForm, Controller } from 'react-hook-form';
import { alpha, useTheme } from '@mui/material/styles';
import api from '../utils/api';

function ContactForm() {
  const theme = useTheme();
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/forms', { nome: data.name, email: data.email, mensagem: data.message });
      setSubmitted(true);
      reset();
    } catch {
      setSubmitError('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmitError('');
    reset();
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      '& fieldset': { borderColor: theme.palette.divider },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.06)}`,
      },
    },
  };

  return (
    <Section
      background={
        theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0b1220 0%, #121a2b 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #ffffffeb 100%)'
      }
      id="contact"
      py={{ xs: 6, md: 10 }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            Tem alguma dúvida?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.secondary, maxWidth: '900px', mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}
          >
            Fale conosco e tire todas as suas dúvidas sobre o nosso software para nutricionistas. Estamos aqui para
            ajudar você a entender como nossa plataforma pode transformar sua prática clínica e melhorar o atendimento
            aos seus pacientes.
          </Typography>
        </Box>

        <Paper
          elevation={1}
          sx={{
            maxWidth: 560,
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
            minHeight: 320,
            display: 'flex',
            alignItems: submitted ? 'center' : 'flex-start',
            justifyContent: 'center',
          }}
        >
          {submitted ? (
            <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
              <CheckIcon
                sx={{
                  fontSize: 64,
                  color: 'success.main',
                  mb: 2,
                }}
              />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Mensagem enviada!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
                Recebemos sua mensagem e entraremos em contato em breve pelo e-mail informado.
              </Typography>
              <Button variant="outlined" size="small" onClick={handleReset}>
                Enviar outra mensagem
              </Button>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
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
                    sx={inputSx}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'E-mail é obrigatório',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'E-mail inválido' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="E-mail"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    variant="outlined"
                    inputProps={{ 'aria-label': 'email' }}
                    sx={inputSx}
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
                    sx={inputSx}
                  />
                )}
              />

              {submitError && (
                <Alert severity="error" onClose={() => setSubmitError('')}>
                  {submitError}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  sx={{ px: 4, minWidth: 140 }}
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Section>
  );
}

export { ContactForm };
