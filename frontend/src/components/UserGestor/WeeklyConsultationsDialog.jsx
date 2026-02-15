import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Grid
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { formatDateHuman, getConsultationStatus } from '../../utils/userGestorUtils';

export default function WeeklyConsultationsDialog({ 
  open, 
  onClose, 
  weeklyAppointments,
  users,
  onStartConsultation,
  persistActivePatient,
  setSnackbar,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 2 }}>📅 Consultas</DialogTitle>
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Data Início"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Data Fim"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>
      <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {weeklyAppointments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma consulta agendada no período selecionado.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {weeklyAppointments.map(a => {
              const status = getConsultationStatus(a.date);
              const formattedDate = formatDateHuman(a.date, a.time);
              
              return (
                <Paper
                  key={a.id}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    backgroundColor: a.status === 'finalizada' ? '#f5f5f5' : '#fafafa',
                    transition: 'all 0.3s',
                    opacity: a.status === 'finalizada' ? 0.7 : 1,
                    '&:hover': a.status === 'finalizada' ? {} : {
                      boxShadow: 2,
                      backgroundColor: '#f5f5f5',
                      borderColor: '#2e7d32',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b5e20' }}>
                        {a.userName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                        <Chip
                          icon={<Typography sx={{ fontSize: '1rem !important', mr: 0.5 }}>{status.icon}</Typography>}
                          label={a.status === 'finalizada' ? 'Finalizada' : status.label}
                          size="small"
                          sx={{
                            backgroundColor: a.status === 'finalizada' ? '#c8e6c9' : status.bgColor,
                            color: a.status === 'finalizada' ? '#2e7d32' : status.color,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: 28
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {formattedDate}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {a.note && (
                    <Box sx={{ mb: 2, p: 1.5, borderLeft: '3px solid #2e7d32', backgroundColor: '#f9fdf8', borderRadius: '4px' }}>
                      <Typography variant="body2" sx={{ color: '#333', fontStyle: 'italic', fontSize: '0.95rem' }}>
                        "{a.note}"
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={a.status === 'finalizada'}
                    endIcon={a.status === 'finalizada' ? null : <PlayArrowIcon />}
                    onClick={() => {
                      const patientName = a.userName || users.find(u => u.id === a.userId)?.name || 'Paciente';
                      persistActivePatient(a.userId, patientName);
                      onStartConsultation(a);
                      setSnackbar({ open: true, message: '🟢 Consulta iniciada!', severity: 'success' });
                    }}
                    sx={{
                      backgroundColor: a.status === 'finalizada' ? '#bdbdbd' : '#2e7d32',
                      color: a.status === 'finalizada' ? '#666' : 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.3,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: a.status === 'finalizada' ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': a.status === 'finalizada' ? {} : { backgroundColor: '#256026' }
                    }}
                  >
                    {a.status === 'finalizada' ? '✅ Consulta Finalizada' : 'Entrar na Consulta'}
                  </Button>
                </Paper>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
