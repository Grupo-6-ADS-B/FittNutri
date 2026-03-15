import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Button,
  MenuItem
} from "@mui/material";
import { computeImc } from '../../utils/userGestorUtils';
import calcularTMB from '../../utils/calcularTMB';
import { useEffect } from 'react';

export default function UpdateDataDialog({ 
  open, 
  onClose, 
  onSave,
  updateForm,
  setUpdateForm,
  selectedUser
}) {
  useEffect(() => {
    if (!selectedUser || !open) return;

    const peso = parseFloat(String(updateForm.peso || '').replace(',', '.'));
    const altura = parseFloat(String(updateForm.altura || '').replace(',', '.'));
    const idade = parseFloat(String(updateForm.idadeMetabolica || selectedUser?.idade || '').replace(',', '.'));
    const sexo = selectedUser?.sexo || 'feminino';
    const atividade = updateForm.atividade || selectedUser?.atividade || 'sedentário';

    if (peso > 0 && altura > 0 && idade > 0) {
      const tmbCalculada = calcularTMB(peso, altura, idade, sexo, atividade);
      if (tmbCalculada && Number.isFinite(tmbCalculada)) {
        const tmbArredondada = Math.round(tmbCalculada).toString();
        if (updateForm.taxaMetabolicaBasal !== tmbArredondada) {
          setUpdateForm(f => ({
            ...f,
            taxaMetabolicaBasal: tmbArredondada
          }));
        }
      }
    }
  }, [updateForm.peso, updateForm.altura, updateForm.idadeMetabolica, updateForm.atividade, selectedUser, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Atualizar Dados do Paciente</DialogTitle>
      <DialogContent sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pb: 2 }}>
        <TextField 
          sx={{ mt: 4 }} 
          label="Nome" 
          value={updateForm.name} 
          onChange={(e) => setUpdateForm(f => ({ ...f, name: e.target.value }))} 
          fullWidth 
        />
        <TextField 
          sx={{ mt: 4 }} 
          label="IMC" 
          value={computeImc(updateForm.peso, updateForm.altura)} 
          disabled 
          helperText="Calculado automaticamente"
          fullWidth 
        />

        <TextField 
          label="Peso (kg)" 
          value={updateForm.peso} 
          onChange={(e) => setUpdateForm(f => ({ ...f, peso: e.target.value }))} 
          fullWidth 
        />
        <TextField 
          label="Altura (cm)" 
          value={updateForm.altura} 
          onChange={(e) => setUpdateForm(f => ({ ...f, altura: e.target.value }))} 
          fullWidth 
        />
        <TextField
          label="Idade (anos)"
          value={updateForm.idade}
          onChange={(e) => setUpdateForm(f => ({ ...f, idade: e.target.value }))}
          fullWidth
          type="number"
        />
        <TextField
          label="Idade Metabólica"
          value={updateForm.idadeMetabolica}
          onChange={(e) => setUpdateForm(f => ({ ...f, idadeMetabolica: e.target.value }))}
          fullWidth
        />
        <TextField 
          label="Massa Muscular (kg)" 
          value={updateForm.massaMuscular} 
          onChange={(e) => setUpdateForm(f => ({ ...f, massaMuscular: e.target.value }))} 
          fullWidth 
        />
        <TextField 
          label="Gordura (%)" 
          value={updateForm.porcentagemGordura} 
          onChange={(e) => setUpdateForm(f => ({ ...f, porcentagemGordura: e.target.value }))} 
          fullWidth 
        />
        <TextField 
          label="Gordura Visceral (%)" 
          value={updateForm.gorduraVisceral} 
          onChange={(e) => setUpdateForm(f => ({ ...f, gorduraVisceral: e.target.value }))} 
          fullWidth 
        />
        <TextField 
          label="Taxa Metabólica Basal (kcal)" 
          value={updateForm.taxaMetabolicaBasal} 
          disabled
          fullWidth 
          helperText="Calculado automaticamente"
        />

        <TextField
          select
          label="Nível de atividade física"
          value={updateForm.atividade}
          onChange={(e) => setUpdateForm(f => ({ ...f, atividade: e.target.value }))}
          fullWidth
        >
          <MenuItem value="sedentário">Sedentário</MenuItem>
          <MenuItem value="levemente ativo">Levemente ativo</MenuItem>
          <MenuItem value="moderadamente ativo">Moderadamente ativo</MenuItem>
          <MenuItem value="muito ativo">Muito ativo</MenuItem>
          <MenuItem value="extremamente ativo">Extremamente ativo</MenuItem>
        </TextField>

        <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Circunferências</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
            {Object.keys(updateForm.circ).map((k) => (
              <TextField
                key={k}
                label={k}
                value={updateForm.circ[k] || ""}
                onChange={(e) => setUpdateForm(f => ({ 
                  ...f, 
                  circ: { ...f.circ, [k]: e.target.value } 
                }))}
                fullWidth
              />
            ))}
          </Box>
        </Box>

        <TextField 
          label="Data da Consulta (obrigatória)" 
          type="date" 
          value={updateForm.date} 
          onChange={(e) => setUpdateForm(f => ({ ...f, date: e.target.value }))} 
          InputLabelProps={{ shrink: true }} 
          fullWidth 
          sx={{ gridColumn: "1 / -1" }} 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}
