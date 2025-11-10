import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CssBaseline,
  Box,
  Card,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from "@mui/icons-material/Delete";

const defaultUsers = [
  { id: 1, name: "André Goulart", email: "andre.goulart@example.com", telefone: "(11) 98765-4321", cidade: "São Paulo", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", telefone: "(21) 91234-5678", cidade: "Rio de Janeiro", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Pedro Henrique", email: "pedro.henrique@example.com", telefone: "(31) 99876-5432", cidade: "Belo Horizonte", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Julia Carvalho", email: "julia.carvalho@example.com", telefone: "(41) 98765-1234", cidade: "Curitiba", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 5, name: "Lucas Oliveira", email: "lucas.oliveira@example.com", telefone: "(51) 91234-8765", cidade: "Porto Alegre", avatar: "https://i.pravatar.cc/150?img=4" },
];

export default function UserGestor(props) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUsers(Array.isArray(parsed) ? parsed : defaultUsers);
      } catch {
        setUsers(defaultUsers);
      }
    } else {
      setUsers(defaultUsers);
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleAddUser = () => {
    navigate("/register");
  };

  const requestDeleteUser = (user) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    const uid = userToDelete.id;
    setUsers((prev) => {
      const updated = prev.filter(u => u.id !== uid);
      try { localStorage.setItem('users', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try { localStorage.removeItem(`questionario_${uid}`); } catch {}
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  const cancelDeleteUser = () => {
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    const onFocus = () => {
      const stored = localStorage.getItem('users');
      if (stored) {
        try { setUsers(JSON.parse(stored)); } catch {}
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const raw = user[filterType] || (filterType === 'telefone' ? (user.telefone || user.phone) : undefined);
    const value = raw?.toString().toLowerCase();
    return value && value.includes(term);
  });
  const displayUsers = filteredUsers;


  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "88vh",
          background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)'
        }}
      >

        {/* Conteúdo principal */}
        <Box sx={{ flex: 1, p: 3, display: 'flex', justifyContent: 'center' }}>
          <Card sx={{ width: '100%', maxWidth: 1200, borderRadius: '20px', p: 2, boxShadow: 3, minHeight: 350, maxHeight: 600, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                Gerenciamento de Usuários
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mr: 2 }}>
                <TextField
                  select
                  variant="outlined"
                  size="small"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListIcon />
                      </InputAdornment>
                    ),
                    style: { borderRadius: '15px' }
                  }}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="name">Nome</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="telefone">Telefone</MenuItem>
                  <MenuItem value="cidade">Endereço</MenuItem>
                </TextField>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    style: { borderRadius: '15px' }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddUser}
                  sx={{ borderRadius: '15px', height: '40px', minWidth: '40px', backgroundColor: '#2e7d32' }}
                >
                  Adicionar Usuário
                </Button>
              </Box>
            </Box>

            <List
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                pr: 1,
                gap: 1
              }}
            >
              {displayUsers.map((user, index) => (
                <React.Fragment key={user?.id || index}>
                  <ListItem
                    sx={{
                      my: 1,
                      borderRadius: '15px',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        backgroundColor: user?.name ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                      },
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {user?.name ? (
                      <>
                        <ListItemAvatar>
                          <Avatar
                            src={user.avatar ? user.avatar : '/avatar-default.png'}
                            sx={{ width: 50, height: 50, border: "2px solid #2e7d32" }}
                          >
                            {(!user.avatar && user.name) ? user.name.charAt(0) : null}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          primaryTypographyProps={{ fontWeight: 'bold', width: '150px', flexShrink: 0 }}
                        />
                        <ListItemText primary={user.email} sx={{ width: '250px', flexShrink: 0, mx: 2 }} />
                        <ListItemText primary={user.telefone || user.phone} sx={{ width: '150px', flexShrink: 0, mx: 2 }} />
                        <ListItemText primary={user.cidade} sx={{ width: '150px', flexShrink: 0, mx: 2 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              try { localStorage.setItem('lastUserId', String(user.id)); } catch {}
                              let target = '/questionario';
                              let state = { user };
                              try {
                                const raw = localStorage.getItem(`questionario_${user.id}`);
                                if (raw) {
                                  const parsed = JSON.parse(raw);
                                  const done = parsed?.completed?.antropo && parsed?.completed?.circ;
                                  if (done) {
                                    target = '/resumo-circunferencia';
                                    state = { user, antropoData: parsed.antropoData || {}, dados: parsed.circData || {} };
                                  } else {
                                    state = { user, antropoData: parsed.antropoData || {}, dados: parsed.circData || {} };
                                  }
                                }
                              } catch {}
                              navigate(target, { state });
                            }}
                          >
                            Ver Dados
                          </Button>
                          <IconButton
                            color="secondary"
                            onClick={() => requestDeleteUser(user)}
                            sx={{ ml: 1, '&:hover': { color: 'error.main', backgroundColor: 'rgba(244, 67, 54, 0.08)' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </>
                    ) : null}
                  </ListItem>
                  {user?.name && index < displayUsers.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}

              {/* Linha para adicionar novo usuário removida, agora o botão está acima */}
            </List>
            {/* Modal de confirmação de exclusão */}
            <Dialog open={confirmOpen} onClose={cancelDeleteUser} aria-labelledby="confirm-delete-title">
              <DialogTitle id="confirm-delete-title">Confirmação</DialogTitle>
              <DialogContent>
                <Typography>Deseja excluir esse usuário?</Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'flex-start', gap: 1, pl: 2 }}>
                <Button onClick={cancelDeleteUser} variant="outlined" color="secondary">Cancelar</Button>
                <Button onClick={confirmDeleteUser} variant="contained" color="error">Excluir</Button>
              </DialogActions>
            </Dialog>
          </Card>
        </Box>
      </Box>
    </>
  );
}

