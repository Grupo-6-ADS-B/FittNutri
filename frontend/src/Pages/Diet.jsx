import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Stack,
  Divider, Chip, List, ListItem, ListItemText, Avatar, IconButton, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import MealModal from '../components/MealModal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';

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

  const userName = location.state.patientName;
  const userAge = selectedUser?.age ?? selectedUser?.idade ?? null;
  const patientId = selectedUser?.id || null;
console.log('Diet page - selectedUser:', selectedUser);
  const initials = userName
    ? userName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
    : 'NA';

  const handlePrint = async () => {
  try {
    const response = await api.get(`/meals/patient/${patientId}/pdf`, {
      responseType: 'blob' 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dieta-${userName || 'paciente'}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    alert('Erro ao baixar o PDF da dieta.');
  }
};
  const [openMeal, setOpenMeal] = useState(false);
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleOpenMeal = () => { setSelectedMeal(null); setOpenMeal(true); };
  const handleCloseMeal = () => setOpenMeal(false);
  const handleSaveMeal = async (meal) => {
    console.log('handleSaveMeal recebeu:', meal);
    console.log('meal.id:', meal.id);
    console.log('alimentos:', meal.alimentos); 
    
    try {
      const payload = {
        descricao: meal.descricao,
        horario: meal.horario,
        observacao: meal.observacao,
        alimentos: meal.alimentos.map(a => ({
          alimento: a.nome || a.alimento, 
          quantidade: parseFloat(a.quantidade),
          unidade: a.unidade
        }))
      };

      console.log('payload enviado:', payload); 

      if (meal.id) {
        
        console.log('Fazendo PATCH para /meals/' + meal.id);
        await api.put(`/meals/${meal.id}`, payload);
        alert('Refeição atualizada com sucesso!');
      } else {
        
        console.log('Fazendo POST para /meals/meal-by-type/' + patientId);
        await api.post(`/meals/meal-by-type/${patientId}`, payload);
        alert('Refeição adicionada com sucesso!');
      }

      
      await loadMeals();

      setSelectedMeal(null);
      setOpenMeal(false);
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      alert('Erro ao salvar refeição.');
    }
  };

  const handleCopyMeal = (meal) => {
    const text = meal.alimentos?.map(a => `${a.nome} (${a.quantidade} ${a.unidade})`).join(' • ') || '';
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  };

  const handleEditMeal = (meal) => {
    console.log('handleEditMeal - meal antes de abrir modal:', meal); // Debug
    setSelectedMeal(meal);
    setOpenMeal(true);
  };

  const handleDeleteMeal = async (id) => {
    try {
      await api.delete(`/meals/${id}`);
      setMeals(prev => prev.filter(m => m.id !== id));
      alert('Refeição deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar refeição:', error);
      alert('Erro ao deletar refeição.');
    }
  };

  const loadMeals = async () => {
    try {
      const response = await api.get(`/meals/${patientId}`);
      console.log("Refeições carregadas:", response.data);

      const refeicoes = response.data?.refeicoes ?? response.data;
console.log("Refeições processadas:", refeicoes); // Debug
      setMeals((refeicoes || []).map(r => ({
        id: r.id || r.mealId,
        descricao: r.descricao,
        horario: r.horario,
        observacao: r.observacao,
        alimentos: (r.alimentos || []).map(a => ({
          id: a.id,
          nome: a.alimento,
          quantidade: a.quantidade,
          unidade: a.unidade
        }))
      })));
      console.log("Meals mapeadas:", mealsList); // Debug
      setMeals(mealsList);
            console.log("Meals state atualizado"); 

    } catch (err) {
      console.error("Erro carregando refeições:", err);
    }
  };

  useEffect(() => {
    if (patientId) loadMeals();
  }, [patientId]);


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
              <Button startIcon={<ArrowBackIcon />} size="small" onClick={() => navigate(-1)} variant="text">Voltar</Button>
            </Box>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                Imprimir Plano
              </Button>
              <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenMeal}>
                Adicionar Refeição
              </Button>
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
              
                            {meals.length > 0 ? (
              <Stack spacing={2} sx={{ mt: 2, width: '100%', mb: 2 }}>
                {meals.map(m => (
                  <Paper key={m.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'inline-block' }}>
                          {m.descricao || 'Refeição'}
                        </Typography>
                        {m.horario && (
                          <Typography variant="body2" component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                            {m.horario}
                          </Typography>
                        ) }
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title="Copiar alimentos">
                          <IconButton size="small" onClick={() => handleCopyMeal(m)}><ContentCopyIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEditMeal(m)}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => handleDeleteMeal(m.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={m.alimentos && m.alimentos.length ? m.alimentos.map(a => `${a.nome} (${a.quantidade} ${a.unidade})`).join('\n') : ''}
                        multiline
                        InputProps={{ readOnly: true }}
                      />
                      {m.observacao && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Obs: {m.observacao}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : (
                <>
                <Avatar sx={{ bgcolor: '#e8f5e9', width: 88, height: 88, mb: 2 }}>
                <AddCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1 }}>Refeições</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Esse plano alimentar não possui refeições. Comece adicionando a esse paciente uma avaliação ou uma prescrição.
              </Typography></>)}
              <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenMeal}>Adicionar Refeição</Button>
            </Paper>

            <Paper sx={{ p: 3, '@media print': { display: 'none' } }}>
              <Typography variant="h6" gutterBottom>Quer agilizar a elaboração da dieta?</Typography>
              <Typography variant="body2" color="text.secondary">Experimente visualizar e carregar um plano alimentar já salvo.</Typography>
              <Button sx={{ mt: 2 }} variant="contained">Ver modelos</Button>
            </Paper>


            <MealModal open={openMeal} patientId={patientId} onClose={handleCloseMeal} onSave={handleSaveMeal} initial={selectedMeal} />
          </Stack>
        </Grid>


      </Grid>
    </Box>
  );
}