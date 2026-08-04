import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  Autocomplete,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../utils/api';

export default function DietEditorModal({ open, onClose, dietModel, patientId, onDietSaved }) {
  const [formData, setFormData] = useState(null);
  const [allAlimentos, setAllAlimentos] = useState([]);
  const [loadingAlimentos, setLoadingAlimentos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && dietModel) {
      setFormData({
        nome: dietModel.nome || '',
        observacao: dietModel.observacao || '',
        refeicoes: (dietModel.refeicoes || []).map(ref => ({
          id: ref.id,
          nome: ref.nome || ref.descricao || '',
          horario: ref.horario || '',
          observacao: ref.observacao || '',
          itens: (ref.itens || ref.alimentos || []).map(item => ({
            id: item.id,
            alimentoId: item.alimentoId || null,
            nomeAlimento: item.nomeAlimento || item.alimento || item.nome || item.descricao || '',
            quantidade: item.quantidade !== undefined && item.quantidade !== null ? item.quantidade : 100,
            unidade: item.unidade || 'g',
            observacao: item.observacao || ''
          }))
        }))
      });
      setError(null);
    }
  }, [open, dietModel]);

  useEffect(() => {
    if (open) {
      loadAlimentos();
    }
  }, [open]);

  const loadAlimentos = async () => {
    setLoadingAlimentos(true);
    try {
      const response = await api.get('/alimentos?page=0&size=500');
      let alimentosList = [];
      if (Array.isArray(response.data)) {
        alimentosList = response.data;
      } else if (response.data?.content) {
        alimentosList = response.data.content;
      }
      setAllAlimentos(alimentosList);
    } catch (err) {
      console.error('Erro ao carregar alimentos:', err);
    } finally {
      setLoadingAlimentos(false);
    }
  };

  const handleDietNameChange = (e) => {
    setFormData(prev => ({ ...prev, nome: e.target.value }));
  };

  const handleDietObservationChange = (e) => {
    setFormData(prev => ({ ...prev, observacao: e.target.value }));
  };

  const handleMealNameChange = (mealIndex, value) => {
    setFormData(prev => {
      const newRefeicoes = [...prev.refeicoes];
      newRefeicoes[mealIndex] = { ...newRefeicoes[mealIndex], nome: value };
      return { ...prev, refeicoes: newRefeicoes };
    });
  };

  const handleMealTimeChange = (mealIndex, value) => {
    setFormData(prev => {
      const newRefeicoes = [...prev.refeicoes];
      newRefeicoes[mealIndex] = { ...newRefeicoes[mealIndex], horario: value };
      return { ...prev, refeicoes: newRefeicoes };
    });
  };

  const handleMealObservationChange = (mealIndex, value) => {
    setFormData(prev => {
      const newRefeicoes = [...prev.refeicoes];
      newRefeicoes[mealIndex] = { ...newRefeicoes[mealIndex], observacao: value };
      return { ...prev, refeicoes: newRefeicoes };
    });
  };

  const handleAddMeal = () => {
    setFormData(prev => ({
      ...prev,
      refeicoes: [
        ...prev.refeicoes,
        {
          nome: 'Nova Refeição',
          horario: '12:00',
          observacao: '',
          itens: []
        }
      ]
    }));
  };

  const handleRemoveMeal = (mealIndex) => {
    setFormData(prev => ({
      ...prev,
      refeicoes: prev.refeicoes.filter((_, i) => i !== mealIndex)
    }));
  };

  const handleAddFoodItem = (mealIndex) => {
    setFormData(prev => {
      const newRefeicoes = [...prev.refeicoes];
      const newItens = [
        ...newRefeicoes[mealIndex].itens,
        {
          alimentoId: null,
          nomeAlimento: '',
          quantidade: 100,
          unidade: 'g',
          observacao: ''
        }
      ];
      newRefeicoes[mealIndex] = { ...newRefeicoes[mealIndex], itens: newItens };
      return { ...prev, refeicoes: newRefeicoes };
    });
  };

  const handleRemoveFoodItem = (mealIndex, itemIndex) => {
    setFormData(prev => {
      const newRefeicoes = [...prev.refeicoes];
      const newItens = newRefeicoes[mealIndex].itens.filter((_, i) => i !== itemIndex);
      newRefeicoes[mealIndex] = { ...newRefeicoes[mealIndex], itens: newItens };
      return { ...prev, refeicoes: newRefeicoes };
    });
  };

  const handleFoodItemChange = (mealIndex, itemIndex, field, value) => {
    setFormData(prev => {
      const newRefeicoes = [...prev.refeicoes];
      const newItens = [...newRefeicoes[mealIndex].itens];
      newItens[itemIndex] = { ...newItens[itemIndex], [field]: value };
      newRefeicoes[mealIndex] = { ...newRefeicoes[mealIndex], itens: newItens };
      return { ...prev, refeicoes: newRefeicoes };
    });
  };

  const handleSaveDiet = async () => {
    if (!patientId) {
      setError('Paciente não especificado. Selecione o paciente antes de salvar a dieta.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const requestPayload = {
        refeicoes: formData.refeicoes.map(ref => {
          const nomeRefeicao = ref.nome || 'Refeição';
          const prefixo = formData.nome ? `📋 Dieta Modelo: ${formData.nome} - ` : '📋 Dieta Modelo - ';
          const descricaoFinal = nomeRefeicao.startsWith('📋 Dieta Modelo')
            ? nomeRefeicao
            : `${prefixo}${nomeRefeicao}`;

          return {
            descricao: descricaoFinal,
            horario: ref.horario || '',
            observacao: ref.observacao || '',
            alimentos: ref.itens.map(item => ({
              alimento: item.nomeAlimento || item.descricao || 'Alimento sem nome',
              quantidade: parseFloat(item.quantidade) || 0,
              unidade: item.unidade || 'g'
            }))
          };
        })
      };

      const response = await api.post(`/meals/full-diet/${patientId}`, requestPayload);

      if (response.status === 200 || response.status === 201) {
        if (onDietSaved) {
          onDietSaved();
        }
        onClose();
      }
    } catch (err) {
      console.error('Erro ao salvar dieta do modelo:', err);
      setError('Erro ao aplicar o modelo de dieta para o paciente. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EditIcon color="success" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Editar e Aplicar Dieta: {formData.nome}
          </Typography>
        </Box>
        <Chip label="Modelo" color="success" variant="outlined" size="small" />
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Informações da Dieta */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Modelo"
                value={formData.nome}
                onChange={handleDietNameChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Observações Gerais da Dieta"
                value={formData.observacao}
                onChange={handleDietObservationChange}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestaurantIcon color="primary" fontSize="small" />
            Refeições ({formData.refeicoes.length})
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddMeal}
            variant="outlined"
            color="success"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Adicionar Refeição
          </Button>
        </Box>

        {/* Lista de Refeições */}
        {formData.refeicoes.map((meal, mealIndex) => (
          <Paper
            key={mealIndex}
            elevation={1}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome da Refeição"
                  value={meal.nome}
                  onChange={(e) => handleMealNameChange(mealIndex, e.target.value)}
                />
              </Grid>
              <Grid item xs={10} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Horário"
                  value={meal.horario}
                  onChange={(e) => handleMealTimeChange(mealIndex, e.target.value)}
                  placeholder="Ex: 08:00"
                  InputProps={{
                    startAdornment: <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={2} sm={2} sx={{ textAlign: 'right' }}>
                <IconButton color="error" onClick={() => handleRemoveMeal(mealIndex)} title="Remover refeição">
                  <DeleteIcon />
                </IconButton>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Observação da Refeição (opcional)"
                  value={meal.observacao}
                  onChange={(e) => handleMealObservationChange(mealIndex, e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1.5 }} />

            {/* Itens Alimentares da Refeição */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Alimentos desta refeição
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddFoodItem(mealIndex)}
                  sx={{ textTransform: 'none' }}
                >
                  Adicionar Alimento
                </Button>
              </Box>

              {meal.itens.map((item, itemIndex) => (
                <Grid container spacing={1.5} alignItems="center" key={itemIndex} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={5}>
                    <Autocomplete
                      size="small"
                      options={allAlimentos}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        return option.nome || option.nomeAlimento || option.descricao || '';
                      }}
                      freeSolo
                      value={item.nomeAlimento}
                      onInputChange={(e, newValue) => {
                        handleFoodItemChange(mealIndex, itemIndex, 'nomeAlimento', newValue);
                      }}
                      onChange={(e, value) => {
                        const selectedName = typeof value === 'string' ? value : value?.nome || '';
                        handleFoodItemChange(mealIndex, itemIndex, 'nomeAlimento', selectedName);
                      }}
                      loading={loadingAlimentos}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Alimento"
                          placeholder="Digite ou selecione..."
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingAlimentos ? <CircularProgress color="inherit" size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={5} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Quantidade"
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => handleFoodItemChange(mealIndex, itemIndex, 'quantidade', e.target.value)}
                      inputProps={{ step: '0.1' }}
                    />
                  </Grid>

                  <Grid item xs={5} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Unidade"
                      value={item.unidade}
                      onChange={(e) => handleFoodItemChange(mealIndex, itemIndex, 'unidade', e.target.value)}
                      placeholder="Ex: g, ml, colher"
                    />
                  </Grid>

                  <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveFoodItem(mealIndex, itemIndex)}
                      title="Remover alimento"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              {meal.itens.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                  Nenhum alimento nesta refeição. Clique em "Adicionar Alimento".
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSaveDiet}
          variant="contained"
          color="success"
          disabled={saving}
          sx={{ px: 3, fontWeight: 600 }}
        >
          {saving ? 'Aplicando...' : 'Salvar Dieta Personalizada'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
