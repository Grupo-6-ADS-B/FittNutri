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
  Grid,
  Pagination
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { formatDateHuman, getConsultationStatus } from '../../utils/userGestorUtils';

export default function WeeklyConsultationsDialog({ 
  open, 
  onClose, 
  weeklyAppointments,
  appointmentsPage,
  appointmentsTotalPages,
  onAppointmentsPageChange,
  users,
  onStartConsultation,
  persistActivePatient,
  setSnackbar,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  const theme = useTheme();
  const getToneStyles = (tone) => {
    switch (tone) {
      case 'success':
        return {
          backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
          color: theme.palette.success.main,
          borderColor: theme.palette.success.main,
        };
      case 'info':
        return {
          backgroundColor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
          color: theme.palette.info.main,
          borderColor: theme.palette.info.main,
        };
      case 'error':
        return {
          backgroundColor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
          color: theme.palette.error.main,
          borderColor: theme.palette.error.main,
        };
      default:
        return {
          backgroundColor: theme.palette.action.hover,
          color: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
        };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 2, color: theme.palette.text.primary }}>📅 Consultas</DialogTitle>
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
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: a.status === 'finalizada' ? theme.palette.action.disabledBackground : theme.palette.background.paper,
                    transition: 'all 0.3s',
                    opacity: a.status === 'finalizada' ? 0.7 : 1,
                    '&:hover': a.status === 'finalizada' ? {} : {
                      boxShadow: 2,
                      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.06),
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        {a.userName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                        <Chip
                          icon={<Typography sx={{ fontSize: '1rem !important', mr: 0.5 }}>{status.icon}</Typography>}
                          label={a.status === 'finalizada' ? 'Finalizada' : status.label}
                          size="small"
                          sx={{
                            ...(a.status === 'finalizada' ? getToneStyles('success') : getToneStyles(status.tone)),
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
                    <Box sx={{ mb: 2, p: 1.5, borderLeft: `3px solid ${theme.palette.primary.main}`, backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05), borderRadius: '4px' }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontStyle: 'italic', fontSize: '0.95rem' }}>
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
                      backgroundColor: a.status === 'finalizada' ? theme.palette.action.disabledBackground : theme.palette.primary.main,
                      color: a.status === 'finalizada' ? theme.palette.text.secondary : theme.palette.primary.contrastText,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.3,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: a.status === 'finalizada' ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': a.status === 'finalizada' ? {} : { backgroundColor: theme.palette.primary.dark }
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
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Página {appointmentsPage} de {appointmentsTotalPages}
          </Typography>
          <Pagination
            page={appointmentsPage}
            count={appointmentsTotalPages}
            onChange={onAppointmentsPageChange}
            color="success"
            showFirstButton
            showLastButton
          />
        </Box>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
