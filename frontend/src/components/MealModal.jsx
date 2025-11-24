
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, IconButton, List, ListItem, ListItemText, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../utils/api';

export default function MealModal({ open, onClose, onSave, initial = null }) {
  const [meal, setMeal] = useState({ horario: '', descricao: '', alimentos: [], observacao: '' });
  const [alimentosDisponiveis, setAlimentosDisponiveis] = useState([]);

  useEffect(() => {
    setMeal(initial ?? { horario: '', descricao: '', alimentos: [], observacao: '' });
  }, [initial, open]);

  useEffect(() => {
    async function fetchAlimentos() {
      try {
        const response = await api.get('/alimentos');
        setAlimentosDisponiveis(Array.isArray(response.data) ? response.data : []);
      } catch {
        setAlimentosDisponiveis([]);
      }
    }
    fetchAlimentos();
  }, []);

  const handleChange = (key) => (e) => setMeal(prev => ({ ...prev, [key]: e.target.value }));
  const addFood = (alimentoId) => {
    const alimento = alimentosDisponiveis.find(a => a.id === alimentoId);
    if (alimento) setMeal(prev => ({ ...prev, alimentos: [...prev.alimentos, alimento] }));
  };
  const removeFood = (id) => setMeal(prev => ({ ...prev, alimentos: prev.alimentos.filter(a => a.id !== id) }));

  const handleSave = () => {
    if (onSave) onSave(meal);
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Adicionar refeição
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField label="Horário" value={meal.horario} onChange={handleChange('horario')} fullWidth placeholder="08:00" />
          </Grid>

          <Grid item xs={12} md={9}>
            <FormControl fullWidth>
              <InputLabel>Descrição</InputLabel>
              <Select value={meal.descricao} label="Descrição" onChange={handleChange('descricao')} displayEmpty>
                <MenuItem value="Café da manhã">Café da manhã</MenuItem>
                <MenuItem value="Colação">Colação</MenuItem>
                <MenuItem value="Almoço">Almoço</MenuItem>
                <MenuItem value="Lanche">Lanche</MenuItem>
                <MenuItem value="Jantar">Jantar</MenuItem>
                <MenuItem value="Ceia">Ceia</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {meal.alimentos.length ? `${meal.alimentos.length} alimento(s) adicionado(s)` : 'Nenhum alimento adicionado ainda'}
              </Box>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Adicionar alimento</InputLabel>
                <Select
                  label="Adicionar alimento"
                  onChange={e => addFood(e.target.value)}
                  value=""
                  displayEmpty
                >
                  <MenuItem value="" disabled>Selecione</MenuItem>
                  {alimentosDisponiveis.filter(a => !meal.alimentos.some(m => m.id === a.id)).map(a => (
                    <MenuItem key={a.id} value={a.id}>{a.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <List dense>
              {meal.alimentos.map(a => (
                <ListItem key={a.id} secondaryAction={<Button size="small" color="error" onClick={() => removeFood(a.id)}>Remover</Button>}>
                  <ListItemText primary={a.nome} />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <TextField value={meal.observacao} onChange={handleChange('observacao')} fullWidth multiline minRows={3} label="Observação" />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={() => { handleSave(); }} variant="contained" color="info">Salvar e Continuar</Button>
        <Button onClick={() => { handleSave(); onClose(); }} variant="contained" color="success">Salvar e Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}