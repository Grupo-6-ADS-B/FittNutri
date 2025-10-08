import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CssBaseline,
  Snackbar,
  Alert
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useNavigate } from "react-router-dom";

export default function UserRegister(props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [notification, setNotification] = useState({ open: false, message: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Usuário cadastrado:", formData);
    setNotification({ open: true, message: `Sucesso! Novo usuário ${formData.name} registrado` });
    setTimeout(() => navigate("/questionario"), 3000);
  };

  const navigate = useNavigate();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: 'url(/aveia.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Paper elevation={4} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
            <Typography variant="h5" gutterBottom>
              Cadastro de Usuário
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary">
                Cadastrar
              </Button>
            </Box>
          </Paper>
        </Box>
        <Footer />
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={() => setNotification({ open: false, message: "" })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 8 }}
        >
          <Alert onClose={() => setNotification({ open: false, message: "" })} severity="success" sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
