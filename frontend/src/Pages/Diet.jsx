import {
  Box, Grid, Paper, Typography, TextField, Button, Stack, Avatar
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { useState } from 'react';
import MealModal from '../components/MealModal';

export default function Diet() {

    const navigate = useNavigate();
  const location = useLocation();

  const selectedUser = location.state?.user ?? (() => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.length ? users[users.length - 1] : null;
    } catch {
      return null;
    }
  })();

  const userName = selectedUser?.name ?? sessionStorage.getItem('nome') ?? 'Nome do paciente';
  const userAge = selectedUser?.age ?? selectedUser?.idade ?? null;

  const initials = userName
    ? userName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
    : 'NA';

  const handlePrint = () => window.print();
  const [openMeal, setOpenMeal] = useState(false);
  const handleOpenMeal = () => setOpenMeal(true);
  const handleCloseMeal = () => setOpenMeal(false);
  const handleSaveMeal = (meal) => {
    console.log('meal saved', meal);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: '#f5f8fa', minHeight: '100vh' }}>
            <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.300' }}>
              {initials}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {userName}
              {userAge ? (
                <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}> - {userAge} anos</Typography>
              ) : null}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button startIcon={<ArrowBackIcon />} size="small" onClick={() => navigate(-1)} variant="text">Perfil do Paciente</Button>
            </Box>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                Imprimir Plano
              </Button>
              <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenMeal}>Adicionar Refeição</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Descrição <span style={{color:'#d32f2f'}}>*</span></Typography>
              <TextField
                multiline
                minRows={3}
                placeholder="Plano alimentar para ..."
                fullWidth
                variant="outlined"
              />
            </Paper>

            <Paper sx={{ p: 4, textAlign: 'center', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: '#e8f5e9', width: 88, height: 88, mb: 2 }}>
                <AddCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1 }}>Refeições</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Esse plano alimentar não possui refeições. Comece adicionando a esse paciente uma avaliação ou uma prescrição.
              </Typography>
              <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenMeal}>Adicionar Refeição</Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Quer agilizar a elaboração da dieta?</Typography>
              <Typography variant="body2" color="text.secondary">Experimente visualizar e carregar um plano alimentar já salvo.</Typography>
              <Button sx={{ mt: 2 }} variant="contained">Ver modelos</Button>
            </Paper>
          </Stack>
        </Grid>


      </Grid>
      <MealModal open={openMeal} onClose={handleCloseMeal} onSave={handleSaveMeal} />
    </Box>
  );
}