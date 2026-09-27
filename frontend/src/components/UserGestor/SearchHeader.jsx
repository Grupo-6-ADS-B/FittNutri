import { 
  Paper, 
  TextField, 
  InputAdornment, 
  MenuItem, 
  Button, 
  Box 
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
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
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.95),
        border: `1px solid ${theme.palette.divider}`,
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
              <SearchIcon sx={{ color: theme.palette.primary.main }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: 1,
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: theme.palette.action.hover,
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
              <SortIcon sx={{ color: theme.palette.primary.main }} />
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
          backgroundColor: theme.palette.primary.main,
          textTransform: "none",
          fontWeight: 600,
          "&:hover": { backgroundColor: theme.palette.primary.dark }
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
            backgroundColor: theme.palette.primary.main,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: theme.palette.primary.dark }
          }}
        >
          Adicionar Paciente
        </Button>
      </Box>
    </Paper>
  );
}
