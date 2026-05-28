import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function ScheduleDialog({ 
  open, 
  onClose, 
  onSave,
  scheduleUser,
  apptDate,
  setApptDate,
  apptTime,
  setApptTime,
  apptNote,
  setApptNote
}) {
  const theme = useTheme();
  const minAppointmentDate = new Date().toLocaleDateString('en-CA');

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
          border: `1px solid ${theme.palette.divider}`,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Agendar Consulta
        </Typography>
      </DialogTitle>
      <Divider />
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField 
            label="Paciente" 
            value={scheduleUser?.name || ""} 
            disabled 
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          />
          
          <TextField 
            type="date" 
            label="Data" 
            value={apptDate} 
            onChange={(e) => setApptDate(e.target.value)} 
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minAppointmentDate }}
            fullWidth
            variant="outlined"
          />
          
          <TextField 
            type="time" 
            label="Hora" 
            value={apptTime} 
            onChange={(e) => setApptTime(e.target.value)} 
            InputLabelProps={{ shrink: true }}
            fullWidth
            variant="outlined"
          />
          
          <TextField 
            label="Observação" 
            value={apptNote} 
            onChange={(e) => setApptNote(e.target.value)} 
            multiline 
            minRows={3}
            fullWidth
            variant="outlined"
            placeholder="Adicione observações sobre a consulta"
          />
        </Box>
      </DialogContent>
      
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          variant="text"
          sx={{ 
            color: 'text.secondary',
            fontWeight: 600 
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={onSave}
          color="success"
          sx={{ 
            fontWeight: 600,
            px: 3
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
