import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";

export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  userName 
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmação</DialogTitle>
      <DialogContent>
        <Typography>
          Deseja excluir o paciente {userName ? `"${userName}"` : 'este paciente'}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
