import { 
  Paper, 
  TextField, 
  InputAdornment, 
  MenuItem, 
  Button, 
  Box 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";

export default function SearchHeader({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  onWeekDialogOpen,
  onAddPatient
}) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: 2,
      }}
    >
      <TextField
        placeholder="Buscar por nome, email ou telefone…"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#2e7d32' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: 1,
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#f5f5f5',
          }
        }}
        size="small"
      />

      <TextField
        select
        size="small"
        value={filterType}
        onChange={(e) => onFilterChange(e.target.value)}
        sx={{ minWidth: 160 }}
        label="Ordenar por"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SortIcon sx={{ color: '#2e7d32' }} />
            </InputAdornment>
          ),
        }}
      >
        <MenuItem value="name">Nome</MenuItem>
        <MenuItem value="email">Email</MenuItem>
        <MenuItem value="telefone">Telefone</MenuItem>
        <MenuItem value="cidade">Cidade</MenuItem>
      </TextField>

      <Button
        onClick={onWeekDialogOpen}
        variant="contained"
        startIcon={
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarTodayIcon sx={{ fontSize: 18 }} />
          </Box>
        }
        sx={{
          borderRadius: 2,
          backgroundColor: "#2e7d32",
          textTransform: "none",
          fontWeight: 600,
          "&:hover": { backgroundColor: "#256026" }
        }}
      >
        Consultas
      </Button>

      <Box sx={{ ml: 'auto' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddPatient}
          sx={{
            backgroundColor: "#2e7d32",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#256026" }
          }}
        >
          Adicionar Paciente
        </Button>
      </Box>
    </Paper>
  );
}
