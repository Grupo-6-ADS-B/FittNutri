import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CssBaseline,
  Snackbar,
  Alert,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function UserRegister(props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Campo obrigatório";
    if (!formData.email) newErrors.email = "Campo obrigatório";
    if (!formData.cpf) newErrors.cpf = "Campo obrigatório";
    if (!formData.phone) newErrors.phone = "Campo obrigatório";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    console.log("Usuário cadastrado:", formData);
    setNotification({
      open: true,
      message: `Sucesso! Novo usuário ${formData.name} registrado`,
    });
    setTimeout(() => navigate("/questionario"), 3000);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "url(/aveia.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <Box sx={{ p: 2, alignSelf: "flex-start" }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
          >
            Voltar
          </Button>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 2,
          }}
        >
          <Paper elevation={4} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
            <Typography variant="h5" gutterBottom>
              Cadastro de Usuário
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                error={!!errors.name}
                helperText={errors.name || ""}
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email || ""}
              />
              <TextField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                fullWidth
                error={!!errors.cpf}
                helperText={errors.cpf || ""}
              />
              <TextField
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone || ""}
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
          <Alert
            onClose={() => setNotification({ open: false, message: "" })}
            severity="success"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
