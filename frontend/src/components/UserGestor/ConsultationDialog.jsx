import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Button
} from "@mui/material";
import { alpha, useTheme } from '@mui/material/styles';
import { formatDateHuman } from '../../utils/userGestorUtils';

export default function ConsultationDialog({ 
  open, 
  onClose, 
  startAppointment,
  completedSteps,
  setCompletedSteps,
  onUpdateData,
  onPlanDiet,
  onViewDashboard,
  onFinalize
}) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, py: 1.8, px: 3 }}>
        {startAppointment && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.contrastText }}>
                Consulta em Andamento
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: alpha(theme.palette.primary.contrastText, 0.85), fontSize: '0.9rem' }}>
              {startAppointment.userName} • {formatDateHuman(startAppointment.date, startAppointment.time)}
            </Typography>
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ mt: 2, pt: 2.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: '1.rem', fontWeight: 700, color: theme.palette.text.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ fontSize: '1.1rem' }}>📋</Box> Passos da Consulta
            </Typography>
            
            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main, fontSize: '0.85rem' }}>
                  Progresso
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontSize: '0.9rem' }}>
                  {Object.values(completedSteps).filter(Boolean).length} de 3
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: '8px', backgroundColor: theme.palette.divider, borderRadius: '4px', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${(Object.values(completedSteps).filter(Boolean).length / 3) * 100}%`,
                    backgroundColor: theme.palette.success.main,
                    transition: 'all 0.4s ease',
                    borderRadius: '4px',
                    boxShadow: Object.values(completedSteps).filter(Boolean).length === 3 ? `0 0 12px ${alpha(theme.palette.success.main, 0.4)}` : 'none'
                  }}
                />
              </Box>
              {Object.values(completedSteps).filter(Boolean).length === 3 && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: theme.palette.success.main, fontWeight: 700, fontSize: '0.8rem', animation: 'pulse 2s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } } }}>
                  ✅ Consulta pronta para finalizar
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[
                { key: 'anthropo', icon: '📊', label: 'Atualizar dados antropométricos' },
                { key: 'diet', icon: '📋', label: 'Planejar ou ajustar dieta' },
                { key: 'dashboard', icon: '📈', label: 'Consultar dashboard e tendências' }
              ].map((step) => (
                <Box
                  key={step.key}
                  onClick={() => setCompletedSteps(prev => ({ ...prev, [step.key]: !prev[step.key] }))}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.2,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: completedSteps[step.key] ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.14 : 0.08) : 'transparent',
                    border: completedSteps[step.key] ? `1px solid ${theme.palette.success.main}` : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.10 : 0.05)
                    }
                  }}
                >
                  <Box sx={{ fontSize: '1.3rem' }}>
                    {completedSteps[step.key] ? '☑️' : '⬜'}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: completedSteps[step.key] ? 600 : 500,
                      color: completedSteps[step.key] ? theme.palette.success.main : theme.palette.text.primary,
                      textDecoration: completedSteps[step.key] ? 'line-through' : 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={onUpdateData}
              sx={{
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderRadius: '8px',
                transition: 'all 0.2s',
                border: 'none',
                '&:hover': { 
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              {completedSteps.anthropo ? '✅ Dados Atualizados' : '📊 Atualizar Dados'}
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={onPlanDiet}
              sx={{
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': { 
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
            >
              {completedSteps.diet ? '✅ Dieta Planejada' : '📋 Planejar Dieta'}
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={onViewDashboard}
              sx={{
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#2e7d32',
                color: 'white',
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': { 
                  backgroundColor: '#256026',
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
            >
              {completedSteps.dashboard ? '✅ Dashboard Visualizado' : '📈 Ver Dashboard'}
            </Button>

            {Object.values(completedSteps).filter(Boolean).length === 3 && (
              <Button
                fullWidth
                variant="contained"
                onClick={onFinalize}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  backgroundColor: '#4caf50',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  boxShadow: 2,
                  '&:hover': { 
                    backgroundColor: '#388e3c',
                    transform: 'scale(1.02)',
                    boxShadow: 4
                  },
                }}
              >
                ✅ Finalizar Consulta
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'flex-start', borderTop: '1px solid #f0f0f0' }}>
        <Button 
          onClick={onClose} 
          sx={{
            color: '#888',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
            '&:hover': {
              color: '#2e7d32',
              backgroundColor: 'transparent'
            }
          }}
        >
          ← Voltar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
