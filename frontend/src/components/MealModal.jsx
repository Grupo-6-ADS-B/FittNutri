import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, IconButton, List, ListItem, ListItemText, Box, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../utils/api';

export default function MealModal({ open, onClose, onSave, initial = null }) {
  const [meal, setMeal] = useState({ horario: '', descricao: '', alimentos: [], observacao: '' });
  const [alimentosDisponiveis, setAlimentosDisponiveis] = useState([]);

  useEffect(() => {
    setMeal(initial ?? { horario: '', descricao: '', alimentos: [], observacao: '' });
  }, [initial, open]);

const handleChange = (key) => (eventOrValue) => {
  let value;

  if (eventOrValue?.target) {
    value = eventOrValue.target.value;
  } 
  else {
    value = eventOrValue ?? '';
  }

  setMeal(prev => ({ ...prev, [key]: value }));
};

  const removeFood = (id) => setMeal(prev => ({ ...prev, alimentos: prev.alimentos.filter(a => a.id !== id) }));

  const mockFoods = useMemo(() => ([
    { id: 1, nome: 'Arroz integral' },
    { id: 2, nome: 'Feijão carioca' },
    { id: 3, nome: 'Peito de frango grelhado' },
    { id: 4, nome: 'Ovo cozido' },
    { id: 5, nome: 'Banana prata' },
    { id: 6, nome: 'Maçã' },
    { id: 7, nome: 'Iogurte natural' },
    { id: 8, nome: 'Aveia em flocos' },
    { id: 9, nome: 'Batata doce' },
    { id: 10, nome: 'Salada verde' }
  ]), []);
  
  const times = useMemo(() => {
    const out = [];
    for (let h = 5; h < 24; h++) {
      for (let m of [0, 30]) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        out.push(`${hh}:${mm}`);
      }
    }
    return out;
  }, []);

const fetchFoods = async (q) => {
  const term = String(q || '').trim().toLowerCase();

  return mockFoods.filter(f =>
    f.nome.toLowerCase().includes(term)
  );
};

  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const [selectedQuantity, setSelectedQuantity] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState('g');
  const units = ['g', 'mg', 'unidade', 'colher de sopa', 'copo americano'];

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchFoods(query).then(list => {
      if (!active) return;
      setOptions(list);
      setLoading(false);
    });
    return () => { active = false; };
  }, [query]);

  const handleAddSelectedFood = () => {
  if (!selectedFood || typeof selectedFood !== "object") {
    setError("Selecione um alimento válido da lista.");
    return;
  }

  const proximoAlimento = {
    id: crypto.randomUUID(),
    nome: selectedFood.nome,
    quantidade: Number(selectedQuantity),
    unidade: selectedUnit
  };

  setMeal(prev => ({
    ...prev,
    alimentos: [...prev.alimentos, proximoAlimento]
  }));

  setSelectedFood(null);
  setQuery('');
  setSelectedQuantity(100);
  setSelectedUnit('g');
};

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
            <FormControl fullWidth>
              <InputLabel>Horário</InputLabel>
              <Select
                value={meal.horário ?? meal.horario ?? ''}
                label="Horário"
                onChange={(e) => setMeal(prev => ({ ...prev, horario: e.target.value }))}
                displayEmpty
              >
                <MenuItem value=""></MenuItem>
                {times.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={9}>
            <FormControl fullWidth>
              <InputLabel>Descrição</InputLabel>
              <Select value={meal.descricao} label="Descrição" onChange={handleChange('descricao')} >
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
            <Box sx={{ mb: 1 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Autocomplete
                    freeSolo
                    options={options}
                    getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.nome)}
                    inputValue={query}
                    onInputChange={(e, value) => setQuery(value)}
                    value={selectedFood}
                    onChange={(e, value) => setSelectedFood(value)}
                    loading={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pesquisar alimento"
                        placeholder="Digite para buscar..."
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                        fullWidth
                      />
                    )}
                    sx={{ width: '100%' }}
                  />
                </Grid>

                <Grid item xs={6} md={2}>
                  <TextField
                    label="Quantidade"
                    type="number"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    inputProps={{ min: 0 }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Unidade</InputLabel>
                    <Select value={selectedUnit} label="Unidade" onChange={(e) => setSelectedUnit(e.target.value)}>
                      {units.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleAddSelectedFood}
                  disabled={!(selectedFood || query) || Number(selectedQuantity) <= 0}
                >
                  Adicionar alimento
                </Button>
              </Box>
            </Box>

        

            <List dense>
              {meal.alimentos.map(a => (
                <ListItem key={a.id} secondaryAction={<Button size="small" color="error" onClick={() => removeFood(a.id)}>Remover</Button>}>
                  <ListItemText primary={`${a.nome} — ${a.quantidade} ${a.unidade}`} />
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
        <Button onClick={() => { handleSave(); onClose(); }} variant="contained" color="success">Salvar e Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}