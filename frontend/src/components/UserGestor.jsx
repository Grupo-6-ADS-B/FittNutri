import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";

const mockUsers = [
  { id: 1, name: "André Goulart", email: "andre.goulart@example.com", telefone: "(11) 98765-4321", cidade: "São Paulo", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", telefone: "(21) 91234-5678", cidade: "Rio de Janeiro", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Pedro Henrique", email: "pedro.henrique@example.com", telefone: "(31) 99876-5432", cidade: "Belo Horizonte", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Julia Carvalho", email: "julia.carvalho@example.com", telefone: "(41) 98765-1234", cidade: "Curitiba", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 5, name: "Lucas Oliveira", email: "lucas.oliveira@example.com", telefone: "(51) 91234-8765", cidade: "Porto Alegre", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 6, name: null, avatar: null },
];

export default function UserGestor(props) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const navigate = useNavigate();

  const handleEditClick = (userId) => {
    setEditingUserId(prevId => prevId === userId ? null : userId);
  };

  const handleAddUser = () => {
    navigate("/register");
  };

  const activeUsers = mockUsers.filter(user => user.name !== null);
  const addUserEntry = mockUsers.find(user => user.name === null);

  const filteredUsers = activeUsers.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const value = user[filterType]?.toLowerCase();
    return value && value.includes(term);
  });

  const displayUsers = [...filteredUsers, addUserEntry];


  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundImage: 'url(/uvas.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Header />

        {/* Conteúdo principal */}
        <Box sx={{ flex: 1, p: 3, display: 'flex', justifyContent: 'center' }}>
          <Card sx={{ width: '100%', maxWidth: 1200, borderRadius: '20px', p: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                Gerenciamento de Usuários
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
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
              </Box>
            </Box>

            <List>
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
                          <Avatar src={user.avatar} sx={{ width: 50, height: 50, border: "2px solid #2e7d32" }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          primaryTypographyProps={{ fontWeight: 'bold', width: '150px', flexShrink: 0 }}
                        />
                        <ListItemText primary={user.email} sx={{ width: '250px', flexShrink: 0, mx: 2 }} />
                        <ListItemText primary={user.telefone} sx={{ width: '150px', flexShrink: 0, mx: 2 }} />
                        <ListItemText primary={user.cidade} sx={{ width: '150px', flexShrink: 0, mx: 2 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                          {editingUserId === user.id ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button variant="contained" size="small" onClick={() => navigate('/questionario', { state: { user } })}>Ver Dados</Button>
                              <Button variant="outlined" size="small">Editar</Button>
                            </Box>
                          ) : null}
                          <IconButton onClick={() => handleEditClick(user.id)} sx={{ ml: 1 }}>
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </>
                    ) : (
                      user && (
                        <ListItem button onClick={handleAddUser}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 50, height: 50, backgroundColor: 'transparent' }}>
                              <IconButton
                                sx={{
                                  border: "2px dashed #2e7d32",
                                  width: '100%',
                                  height: '100%',
                                }}
                              >
                                <AddIcon sx={{ color: "#2e7d32" }} />
                              </IconButton>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="Adicionar Usuário" />
                        </ListItem>
                      )
                    )}
                  </ListItem>
                  {user?.name && index < displayUsers.length - 2 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Box>
        <Footer />
      </Box>
    </>
  );
}

