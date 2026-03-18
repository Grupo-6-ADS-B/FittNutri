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
  const minAppointmentDate = new Date().toLocaleDateString('en-CA');

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: 24
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
                backgroundColor: 'grey.50'
              }
            }}
          />
          
          <TextField
            type="date"
            label="Data"
            value={apptDate}
            onChange={(e) => setApptDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minAppointmentDate } }}
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
