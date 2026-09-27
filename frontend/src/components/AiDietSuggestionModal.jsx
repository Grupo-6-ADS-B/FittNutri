import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import DietEditorModal from './DietEditorModal';
import api from '../utils/api';

export default function AiDietSuggestionModal({ open, onClose, patientId, motivoConsulta, onDietSaved }) {
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (open) setObservacoes(motivoConsulta || '');
  }, [open, motivoConsulta]);

  const handleClose = () => {
    if (loading) return;
    setObservacoes('');
    setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!patientId) {
      setError('Não foi possível identificar o paciente. Selecione o paciente novamente.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/meals/suggest-diet/${patientId}`, { observacoes });
      setDraft({
        nome: 'Sugestão da IA',
        observacao: observacoes,
        refeicoes: response.data?.refeicoes || []
      });
      setEditorOpen(true);
    } catch (err) {
      console.error('Erro ao gerar sugestão de dieta com IA:', err);
      const mensagem = err.response?.data?.mensagem
        || 'Não foi possível gerar a sugestão agora. Tente novamente em instantes.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open && !editorOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pt: 3, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Sugerir plano com IA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A IA gera um rascunho com base nos dados do paciente. Você sempre revisa e ajusta antes de aplicar.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Objetivo / restrições / observações (opcional)"
            placeholder="Ex: emagrecimento, paciente vegetariano, evitar lactose, 5 refeições ao dia..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            disabled={loading}
            helperText={motivoConsulta ? 'Pré-preenchido com o motivo da consulta cadastrado — ajuste à vontade.' : ''}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ fontWeight: 600 }}
          >
            {loading ? 'Gerando sugestão...' : 'Gerar sugestão'}
          </Button>
        </DialogActions>
      </Dialog>

      {draft && (
        <DietEditorModal
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setDraft(null);
          }}
          dietModel={draft}
          patientId={patientId}
          onDietSaved={() => {
            setEditorOpen(false);
            setDraft(null);
            setObservacoes('');
            if (onDietSaved) onDietSaved();
            onClose();
          }}
        />
      )}
    </>
  );
}
