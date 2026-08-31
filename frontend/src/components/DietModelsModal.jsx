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
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import EditIcon from '@mui/icons-material/Edit';
import DietEditorModal from './DietEditorModal';
import api from '../utils/api';

export default function DietModelsModal({ open, onClose, patientId, onDietSaved }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedDietModel, setSelectedDietModel] = useState(null);
  const [loadingModelId, setLoadingModelId] = useState(null);

  useEffect(() => {
    if (open) {
      loadModels();
    }
  }, [open]);

  const loadModels = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = query ? `/diets/search?nome=${encodeURIComponent(query)}` : '/diets?page=0&size=50';
      const response = await api.get(endpoint);

      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data?.content) {
        list = response.data.content;
      }
      setModels(list);
    } catch (err) {
      console.error('Erro ao carregar modelos de dieta:', err);
      setError('Não foi possível carregar os modelos de dieta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadModels(value);
  };

  const handleSelectModel = async (modelId) => {
    setLoadingModelId(modelId);
    setError(null);
    try {
      const response = await api.get(`/diets/${modelId}`);
      setSelectedDietModel(response.data);
      setEditorOpen(true);
    } catch (err) {
      console.error('Erro ao carregar detalhes do modelo:', err);
      setError('Erro ao carregar os detalhes do modelo de dieta.');
    } finally {
      setLoadingModelId(null);
    }
  };

  return (
    <>
      <Dialog
        open={open && !editorOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '60vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pt: 3, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RestaurantMenuIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Modelos de Dietas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione um plano alimentar modelo para aplicar e personalizar para o paciente
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar modelo por nome (ex: Hipertrofia, Emagrecimento)..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : models.length > 0 ? (
            <Grid container spacing={2.5}>
              {models.map(model => (
                <Grid item xs={12} sm={6} md={4} key={model.id}>
                  <Card
                    elevation={1}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 8px 24px rgba(46, 125, 50, 0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>
                          {model.nome}
                        </Typography>
                      </Box>

                      {model.observacao && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {model.observacao}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                        <Chip
                          label={`${model.refeicoes ? model.refeicoes.length : 0} refeições`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={
                          loadingModelId === model.id ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <EditIcon />
                          )
                        }
                        disabled={loadingModelId === model.id}
                        onClick={() => handleSelectModel(model.id)}
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                      >
                        {loadingModelId === model.id ? 'Carregando...' : 'Editar e Aplicar'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum modelo de dieta encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tente buscar com outros termos ou crie novos modelos de dieta no sistema.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} color="inherit">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editor Modal para editar a dieta selecionada */}
      {selectedDietModel && (
        <DietEditorModal
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setSelectedDietModel(null);
          }}
          dietModel={selectedDietModel}
          patientId={patientId}
          onDietSaved={() => {
            if (onDietSaved) onDietSaved();
            onClose();
          }}
        />
      )}
    </>
  );
}
