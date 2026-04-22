import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  DialogActions,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../utils/api';

export default function DietModelsModal({ open, onClose, onSelectModel, patientId }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (open) {
      loadDietModels();
    }
  }, [open]);

  const loadDietModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/diets?page=0');
      if (response.data?.content) {
        console.log('Tamanho de content:', response.data.content.length);
      }
      
      let dietContent = [];
      if (Array.isArray(response.data)) {
        console.log('✓ Usando response.data direto (é array)');
        dietContent = response.data;
      } else if (response.data?.content && Array.isArray(response.data.content)) {
        console.log('✓ Usando response.data.content (é array paginado)');
        dietContent = response.data.content;
      } else {
        console.log('✗ Nenhuma estrutura encontrada - resposta será vazia');
      }
      
      console.log('FINAL - Modelos carregados:', dietContent.length);
      if (dietContent.length > 0) {
        console.log('Primeiro modelo:', dietContent[0]);
      }
      
      setModels(dietContent);
    } catch (err) {
      console.error('❌ ERRO:', err);
      console.error('Status do erro:', err.response?.status);
      console.error('Dados do erro:', err.response?.data);
      setError('Erro ao carregar modelos de dieta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = async (modelId) => {
    setSelectedModelId(modelId);
    setLoadingModel(true);
    try {
      const response = await api.get(`/diets/${modelId}`);
      const dietModel = response.data;
      console.log('Modelo carregado:', dietModel);

      const mealRequests = (dietModel.refeicoes || []).map(refeicao => ({
        descricao: refeicao.nome,
        horario: refeicao.horario,
        observacao: refeicao.observacao || '',
        alimentos: (refeicao.itens || []).map(item => ({
          alimento: item.alimento || item.descricao, 
          quantidade: item.quantidade,
          unidade: item.unidade
        }))
      }));

      console.log('Meal requests preparadas:', mealRequests);

      onSelectModel(mealRequests);
      
      onClose();
    } catch (err) {
      console.error('Erro ao carregar modelo de dieta:', err);
      console.error('Error response:', err.response?.data);
      setError('Erro ao carregar o modelo. Tente novamente.');
    } finally {
      setLoadingModel(false);
      setSelectedModelId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>
        Modelos de Dieta
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </div>
        ) : models.length === 0 ? (
          <Alert severity="info">Nenhum modelo de dieta disponível.</Alert>
        ) : (
          <Grid container spacing={2}>
            {models.map(model => (
              <Grid item xs={12} sm={6} md={3} key={model.id}>
                <Card
                  onMouseEnter={() => setHoveredCard(model.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-4px)',
                      '& .edit-button': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <Tooltip title="Carregar modelo">
                    <IconButton
                      size="small"
                      className="edit-button"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#1976d2',
                        color: 'white',
                        zIndex: 10,
                        opacity: hoveredCard === model.id ? 1 : 0,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => handleSelectModel(model.id)}
                      disabled={loadingModel && selectedModelId === model.id}
                    >
                      {loadingModel && selectedModelId === model.id ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <EditIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      minHeight: 120
                    }}
                  >
                    <div>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#333',
                          lineHeight: 1.4
                        }}
                      >
                        {model.nome}
                      </Typography>
                      {model.observacao && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {model.observacao.substring(0, 80)}
                          {model.observacao.length > 80 ? '...' : ''}
                        </Typography>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
