import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Stack, Avatar, IconButton, Tooltip, Snackbar, Alert, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import MealModal from '../components/MealModal';
import DietModelsModal from '../components/DietModelsModal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import api from '../utils/api';

export default function Diet() {
  const theme = useTheme();

    const navigate = useNavigate();
  const location = useLocation();

  const storedPatientId = sessionStorage.getItem('pacienteId') || localStorage.getItem('pacienteId');
  const parsedPatientId = storedPatientId ? parseInt(storedPatientId, 10) : null;
  const storedPatientName = sessionStorage.getItem('pacienteNome') || localStorage.getItem('pacienteNome');

  const selectedUser = location.state?.user ?? (() => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (parsedPatientId) {
        return users.find(u => String(u.id) === String(parsedPatientId)) || (users.length ? users[users.length - 1] : null);
      }
      return users.length ? users[users.length - 1] : null;
    } catch {
      return null;
    }
  })();

  const userName = location.state?.patientName || storedPatientName || selectedUser?.name || 'Paciente';
  const userAge = selectedUser?.age ?? selectedUser?.idade ?? null;
  const patientId = selectedUser?.id || parsedPatientId || null;
  const appointment = location.state?.appointment || null;
  const agendamentoId = appointment?.id || appointment?.appointmentId || null;
  const dataAgendamento = appointment?.date || appointment?.dataAgendada || new Date().toISOString().split("T")[0];
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
const handleSendToS3 = async () => {
  setSendingToS3(true);
  setSnackbar({
    open: true,
    message: 'Enviando dieta para a nuvem. Aguarde...',
    severity: 'info'
  });

  try {
    await api.post(`/meals/patient/${patientId}/pdf/request`, null, {
      params: {
        patientName: userName,
        agendamentoId: agendamentoId || 0,
        dataAgendamento: dataAgendamento
      }
    });

    setSnackbar({
      open: true,
      message: 'Dieta enviada para a nuvem com sucesso.',
      severity: 'success'
    });
  } catch (error) {
    console.error('Erro ao enviar para S3:', error);
    setSnackbar({
      open: true,
      message: 'Erro ao enviar dieta para a nuvem.',
      severity: 'error'
    });
  } finally {
    setSendingToS3(false);
  }
};
  const [openMeal, setOpenMeal] = useState(false);
  const [openModelsModal, setOpenModelsModal] = useState(false);
  const [openConfirmClear, setOpenConfirmClear] = useState(false);
  const [clearingDiet, setClearingDiet] = useState(false);
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [sendingToS3, setSendingToS3] = useState(false);

  const openSnack = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenMeal = () => { setSelectedMeal(null); setOpenMeal(true); };
  const handleCloseMeal = () => setOpenMeal(false);
  const handleSaveMeal = async (meal) => {
    console.log('handleSaveMeal recebeu:', meal);
    console.log('meal.id:', meal.id);
    console.log('alimentos:', meal.alimentos);

    if (!patientId) {
      openSnack('Não foi possível identificar o paciente. Selecione o paciente novamente.', 'error');
      return;
    }

    try {
      const payload = {
        descricao: meal.descricao,
        horario: meal.horario,
        observacao: meal.observacao,
        alimentos: meal.alimentos.map(a => ({
          alimento: a.nome || a.alimento,
          quantidade: parseFloat(a.quantidade),
          unidade: a.unidade,
          foodItemId: a.foodItemId ?? null
        }))
      };

      console.log('payload enviado:', payload); 

      if (meal.id) {
        
        console.log('Fazendo PATCH para /meals/' + meal.id);
        await api.put(`/meals/${meal.id}`, payload);
        openSnack(`Refeição "${meal.descricao || 'sem título'}" atualizada com sucesso no plano de ${userName}.`, 'success');
      } else {
        
        console.log('Fazendo POST para /meals/meal-by-type/' + patientId);
        await api.post(`/meals/meal-by-type/${patientId}`, payload);
        openSnack(`Refeição "${meal.descricao || 'sem título'}" adicionada ao plano de ${userName}.`, 'success');
      }

      
      await loadMeals();

      setSelectedMeal(null);
      setOpenMeal(false);
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      openSnack('Não foi possível salvar a refeição agora. Verifique os dados e tente novamente.', 'error');
    }
  };

  const handleCopyMeal = (meal) => {
    const text = meal.alimentos?.map(a => `${a.nome} (${a.quantidade} ${a.unidade})`).join(' • ') || '';
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  };

  const handleEditMeal = (meal) => {
    setSelectedMeal(meal);
    setOpenMeal(true);
  };

  const handleDeleteMeal = async (id) => {
    try {
      await api.delete(`/meals/${id}`);
      setMeals(prev => prev.filter(m => m.id !== id));
      openSnack('Refeição deletada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao deletar refeição:', error);
      openSnack('Erro ao deletar refeição.', 'error');
    }
  };

  const handleClearDiet = () => {
    if (meals.length === 0) {
      openSnack('Não há refeições para limpar.', 'info');
      return;
    }
    setOpenConfirmClear(true);
  };

  const confirmClearDiet = async () => {
    setClearingDiet(true);
    try {
      await Promise.all(meals.map(meal => api.delete(`/meals/${meal.id}`)));
      setMeals([]);
      setOpenConfirmClear(false);
      openSnack('Todas as refeições foram removidas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao limpar dieta:', error);
      openSnack('Erro ao limpar algumas refeições. Verifique o console.', 'error');
      loadMeals();
    } finally {
      setClearingDiet(false);
    }
  };

  const loadMeals = async () => {
    try {
      const response = await api.get(`/meals/${patientId}`);
      console.log("Refeições carregadas:", response.data);

      const refeicoes = response.data?.refeicoes ?? response.data;
      const mealsList = (refeicoes || []).map(r => ({
        id: r.id || r.mealId,
        descricao: (r.descricao || '').replace(/^📋\s*Dieta\s*Modelo:[^-]+-\s*/i, '').replace(/^📋\s*Dieta\s*Modelo\s*-\s*/i, '').trim(),
        horario: r.horario,
        observacao: r.observacao,
        alimentos: (r.alimentos || []).map(a => ({
          id: a.id,
          nome: a.alimento,
          quantidade: a.quantidade,
          unidade: a.unidade
        }))
      }));
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
    <Box sx={{ p: { xs: 2, md: 4 }, background: theme.palette.background.default, minHeight: '100vh', color: theme.palette.text.primary }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            size="small" 
            onClick={() => navigate(-1)} 
            variant="text"
            sx={{ color: 'text.secondary' }}
          >
            Voltar
          </Button>
          <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', height: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Plano Alimentar — {userName}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            sx={{ fontWeight: 600 }}
          >
            Imprimir
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={sendingToS3 ? <CircularProgress size={18} /> : <CloudUploadIcon />} 
            onClick={handleSendToS3}
            disabled={sendingToS3}
            sx={{ fontWeight: 600 }}
          >
            {sendingToS3 ? "Enviando..." : "Salvar dieta na nuvem"}
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteSweepIcon />} 
            onClick={handleClearDiet}
            disabled={meals.length === 0}
            sx={{ fontWeight: 600 }}
          >
            Limpar Dieta
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<AddCircleOutlineIcon />} 
            onClick={handleOpenMeal}
            sx={{ fontWeight: 600 }}
          >
            Adicionar Refeição
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={4}>
        {meals.length > 0 ? (
          <Stack spacing={3}>
            {meals.map(m => (
              <Paper 
                key={m.id} 
                elevation={3}
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'inline-block' }}>
                      {m.descricao || 'Refeição'}
                    </Typography>
                    {(m.descricao?.includes('Dieta Modelo') || m.descricao?.includes('📋')) && (
                      <Chip
                        label="Modelo de Dieta"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    )}
                    {m.horario && (
                      <Typography variant="body2" component="span" sx={{ color: 'text.secondary', ml: 1, fontWeight: 500 }}>
                        {m.horario}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Copiar alimentos">
                      <IconButton size="small" onClick={() => handleCopyMeal(m)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEditMeal(m)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => handleDeleteMeal(m.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Box>
                  <TextField
                    fullWidth
                    size="medium"
                    variant="outlined"
                    value={m.alimentos && m.alimentos.length ? m.alimentos.map(a => `${a.nome} (${a.quantidade} ${a.unidade})`).join('\n') : ''}
                    multiline
                    InputProps={{ readOnly: true }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.7) : theme.palette.background.default,
                        color: theme.palette.text.primary,
                        '& textarea': { color: theme.palette.text.primary }
                      }
                    }}
                  />
                  {m.observacao && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                      Obs: {m.observacao}
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              minHeight: 300, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: theme.palette.divider,
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
          >
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12), width: 96, height: 96, mb: 3 }}>
              <AddCircleOutlineIcon color="success" sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Nenhuma refeição cadastrada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
              Esse plano alimentar não possui refeições. Use o botão "Adicionar Refeição" no topo da página para começar.
            </Typography>
          </Paper>
        )}

        <Paper sx={{ p: 3, '@media print': { display: 'none' }, borderRadius: 2, bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}` }} elevation={1}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Quer agilizar a elaboração da dieta?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Experimente visualizar e carregar um plano alimentar já salvo.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setOpenModelsModal(true)}>
            Ver modelos
          </Button>
        </Paper>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <MealModal 
        open={openMeal} 
        patientId={patientId} 
        onClose={handleCloseMeal} 
        onSave={handleSaveMeal} 
        initial={selectedMeal} 
      />

      <DietModelsModal
        open={openModelsModal}
        onClose={() => setOpenModelsModal(false)}
        patientId={patientId}
        onDietSaved={() => {
          loadMeals();
          openSnack('Dieta modelo aplicada com sucesso ao plano do paciente!', 'success');
        }}
      />

      {/* Modal Estilizado de Confirmação para Limpar Dieta */}
      <Dialog
        open={openConfirmClear}
        onClose={() => !clearingDiet && setOpenConfirmClear(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main' }}>
          <DeleteSweepIcon color="error" />
          Limpar toda a dieta?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1.5 }}>
            Tem certeza de que deseja remover todas as <strong>{meals.length}</strong> refeições deste plano alimentar?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Esta ação não poderá ser desfeita!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenConfirmClear(false)} color="inherit" disabled={clearingDiet}>
            Cancelar
          </Button>
          <Button
            onClick={confirmClearDiet}
            variant="contained"
            color="error"
            disabled={clearingDiet}
            startIcon={clearingDiet ? <CircularProgress size={18} color="inherit" /> : <DeleteSweepIcon />}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            {clearingDiet ? 'Limpando...' : 'Sim, limpar tudo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
