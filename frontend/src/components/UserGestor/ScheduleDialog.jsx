import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
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
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agendar Consulta</DialogTitle>
      <DialogContent 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 2, 
          minWidth: 320 
        }}
      >
        <TextField 
          label="Paciente" 
          value={scheduleUser?.name || ""} 
          sx={{ mt: 4 }} 
          disabled 
        />
        <TextField 
          type="date" 
          label="Data" 
          value={apptDate} 
          onChange={(e) => setApptDate(e.target.value)} 
          InputLabelProps={{ shrink: true }} 
        />
        <TextField 
          type="time" 
          label="Hora" 
          value={apptTime} 
          onChange={(e) => setApptTime(e.target.value)} 
          InputLabelProps={{ shrink: true }} 
        />
        <TextField 
          label="Observação" 
          value={apptNote} 
          onChange={(e) => setApptNote(e.target.value)} 
          multiline 
          minRows={2} 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}
