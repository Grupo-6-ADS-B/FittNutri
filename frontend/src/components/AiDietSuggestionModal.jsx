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
  IconButton,
  MenuItem
} from '@mui/material';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';

import DietEditorModal from './DietEditorModal';
import api from '../utils/api';

export default function AiDietSuggestionModal({
  open,
  onClose,
  patientId,
  motivoConsulta,
  onDietSaved
}) {
  const [objetivo, setObjetivo] = useState('');
  const [restricoes, setRestricoes] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [numeroRefeicoes, setNumeroRefeicoes] = useState('');
  const [calorias, setCalorias] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setObjetivo(motivoConsulta || '');
      setRestricoes('');
      setPreferencias('');
      setNumeroRefeicoes('');
      setCalorias('');
      setObservacoes('');
      setError(null);
    }
  }, [open, motivoConsulta]);

  const handleClose = () => {
    if (loading) return;

    setObjetivo('');
    setRestricoes('');
    setPreferencias('');
    setNumeroRefeicoes('');
    setCalorias('');
    setObservacoes('');
    setError(null);

    onClose();
  };

  const handleGenerate = async () => {
    if (!patientId) {
      setError(
        'Não foi possível identificar o paciente. Selecione o paciente novamente.'
      );
      return;
    }

    if (!objetivo.trim()) {
      setError('Informe o objetivo principal para gerar a sugestão.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(
        `/meals/suggest-diet/${patientId}`,
        {
          objetivo,
          restricoes,
          preferencias,
          numeroRefeicoes: numeroRefeicoes
            ? Number(numeroRefeicoes)
            : null,
          calorias: calorias
            ? Number(calorias)
            : null,
          observacoes
        }
      );

      setDraft({
        nome: 'Sugestão da IA',
        observacao: observacoes,
        refeicoes: response.data?.refeicoes || []
      });

      setEditorOpen(true);
    } catch (err) {
      console.error('Erro ao gerar sugestão de dieta com IA:', err);

      const mensagem =
        err.response?.data?.mensagem ||
        'Não foi possível gerar a sugestão agora. Tente novamente em instantes.';

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
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            pb: 1,
            pt: 3,
            px: 3
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5
            }}
          >
            <AutoAwesomeIcon
              color="primary"
              sx={{
                fontSize: 28,
                mt: 0.3
              }}
            />

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700
                }}
              >
                Sugerir plano com IA
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Informe os parâmetros do plano. A IA utilizará essas informações
                junto aos dados do paciente para gerar um rascunho.
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={handleClose}
            size="small"
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <TextField
              fullWidth
              select
              label="Objetivo principal"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              disabled={loading}
              required
              helperText={
                motivoConsulta
                  ? 'Pré-preenchido com o motivo da consulta. Você pode alterar.'
                  : ''
              }
            >
              <MenuItem value="Emagrecimento">
                Emagrecimento
              </MenuItem>

              <MenuItem value="Ganho de massa muscular">
                Ganho de massa muscular
              </MenuItem>

              <MenuItem value="Manutenção de peso">
                Manutenção de peso
              </MenuItem>

              <MenuItem value="Reeducação alimentar">
                Reeducação alimentar
              </MenuItem>

              <MenuItem value="Outro">
                Outro
              </MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Restrições alimentares"
              placeholder="Ex: intolerância à lactose, alergia a amendoim, vegetariano..."
              value={restricoes}
              onChange={(e) => setRestricoes(e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Preferências alimentares"
              placeholder="Ex: prefere arroz e feijão, gosta de frango, não gosta de peixe..."
              value={preferencias}
              onChange={(e) => setPreferencias(e.target.value)}
              disabled={loading}
            />

            <Box
              sx={{
                display: 'flex',
                gap: 2
              }}
            >
              <TextField
                fullWidth
                type="number"
                label="Número de refeições"
                placeholder="Ex: 5"
                value={numeroRefeicoes}
                onChange={(e) => setNumeroRefeicoes(e.target.value)}
                disabled={loading}
                inputProps={{
                  min: 1,
                  max: 6
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Meta calórica"
                placeholder="Ex: 1500"
                value={calorias}
                onChange={(e) => setCalorias(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: 'kcal'
                }}
                inputProps={{
                  min: 500
                }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Observações adicionais"
              placeholder="Ex: priorizar refeições simples, alimentos acessíveis e fáceis de preparar..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3
          }}
        >
          <Button
            onClick={handleClose}
            color="inherit"
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleGenerate}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            sx={{
              fontWeight: 600
            }}
          >
            {loading
              ? 'Gerando sugestão...'
              : 'Gerar sugestão'}
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

            setObjetivo('');
            setRestricoes('');
            setPreferencias('');
            setNumeroRefeicoes('');
            setCalorias('');
            setObservacoes('');

            if (onDietSaved) {
              onDietSaved();
            }

            onClose();
          }}
        />
      )}
    </>
  );
}