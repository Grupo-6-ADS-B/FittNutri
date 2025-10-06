  import React, { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { Header } from "./Header";
  import { Footer } from "./Footer";
  import {
    CssBaseline,
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    IconButton,
    Drawer,
    Button,
    CardMedia,
  } from "@mui/material";
  import AddIcon from "@mui/icons-material/Add";

  const mockUsers = [
    { id: 1, name: "André Goulart", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Carlos Lima", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Pedro Henrique", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "Julia Carvalho", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 5, name: "Lucas Oliveira", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 6, name: null, avatar: null },
  ];

export default function UserGestor(props) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#e0e0e0",
        }}
      >
        <Header />

        {/* Conteúdo principal */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Grid container spacing={3}>
            {mockUsers.map((user, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                    cursor: "pointer",
                    border: "2px solid #2e7d32",
                    borderRadius: "20px",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  onClick={() => handleOpen(user)}
                >
                  {user.name ? (
                    <>
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 80,
                          height: 80,
                          mb: 1,
                          border: "3px solid #2e7d32",
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6" align="center">
                          {user.name}
                        </Typography>
                      </CardContent>
                    </>
                  ) : (
                    <>
                      <IconButton
                        sx={{
                          border: "3px dashed #2e7d32",
                          borderRadius: "50%",
                          p: 3,
                        }}
                      >
                        <AddIcon sx={{ fontSize: 60, color: "#2e7d32" }} />
                      </IconButton>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Adicionar Usuário
                      </Typography>
                    </>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Card de explicação abaixo dos usuários */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <Card
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                maxWidth: 800,
                borderRadius: "20px",
                p: 2,
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  Gerenciamento de Usuários
                </Typography>
                <Typography variant="body1">
                  Aqui você pode visualizar, editar e cadastrar usuários do
                  sistema de forma simples e organizada. Utilize os cards acima
                  para acessar as informações de cada usuário ou adicionar novos
                  membros.
                </Typography>
              </CardContent>
              <CardMedia
                component="img"
                sx={{
                  width: { xs: "100%", md: 200 },
                  borderRadius: "15px",
                  ml: { xs: 0, md: 2 },
                  mt: { xs: 2, md: 0 },
                }}
                image="/userGestor.jpeg"
                alt="Descrição do gerenciamento de usuários"
              />
            </Card>
          </Box>
        </Box>

        <Footer />
      </Box>

      {/* Drawer lateral (modal do lado direito) */}
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 300, p: 3 }}>
          {selectedUser?.name ? (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedUser.name}
              </Typography>
              <Button variant="contained" fullWidth sx={{ mb: 2 }}>
                Ver Dados
              </Button>
              <Button variant="outlined" fullWidth>
                Editar
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Novo Usuário
              </Typography>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => navigate("/register")}
              >
                Cadastrar
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}

