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
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function UserRegister(props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    estado: "",
    cidade: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
  });

  const navigate = useNavigate();

  const maskCPF = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
    return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
  };

  const maskPhone = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 4) return `(${ddd}) ${rest}`;
    if (digits.length <= 10) {
      return `(${ddd}) ${rest.slice(0,4)}-${rest.slice(4)}`;
    }
    return `(${ddd}) ${rest.slice(0,5)}-${rest.slice(5)}`;
  };

  const hasAtSign = (email) => email.includes("@");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "cpf") {
      newValue = maskCPF(value);
    } else if (name === "phone") {
      newValue = maskPhone(value);
    } else if (name === "email") {
      newValue = value.trimStart();
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: newValue && !hasAtSign(newValue) ? "Email deve conter @" : null }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Campo obrigatório";
    if (!formData.email) newErrors.email = "Campo obrigatório";
    if (formData.email && !hasAtSign(formData.email)) newErrors.email = "Email deve conter @";
    if (!formData.cpf) newErrors.cpf = "Campo obrigatório";
    if (formData.cpf) {
      const cpfDigits = formData.cpf.replace(/\D/g, "");
      if (cpfDigits.length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos";
    }
    if (!formData.phone) newErrors.phone = "Campo obrigatório";
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length < 10 || phoneDigits.length > 11) newErrors.phone = "Telefone deve ter 10 ou 11 dígitos";
    }
    if (!formData.estado) newErrors.estado = "Campo obrigatório";
    if (!formData.cidade) newErrors.cidade = "Campo obrigatório";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const stored = localStorage.getItem('users');
    const users = stored ? (()=>{ try { return JSON.parse(stored) } catch { return [] } })() : [];
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      telefone: formData.phone,
      cidade: formData.cidade,
      estado: formData.estado,
      avatar: null,
    };
    const updated = Array.isArray(users) && users.length ? [...users, newUser] : [...[] , newUser];
    localStorage.setItem('users', JSON.stringify(updated));

    setNotification({
      open: true,
      message: `Sucesso! Novo usuário ${formData.name} registrado`,
    });
    setTimeout(() => navigate("/questionario", { state: { user: newUser } }), 1200);
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
        <Box sx={{ p: 2, alignSelf: "flex-start" }}>
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
                inputProps={{ inputMode: 'email' }}
              />
              <TextField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                fullWidth
                error={!!errors.cpf}
                inputProps={{ inputMode: 'numeric' }}
              />
              <TextField
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                error={!!errors.phone}
                inputProps={{ inputMode: 'tel' }}
              />
              <TextField
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                fullWidth
                error={!!errors.estado}
                helperText={errors.estado || ""}
              />
              <TextField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                fullWidth
                error={!!errors.cidade}
                helperText={errors.cidade || ""}
              />
              <Button type="submit" variant="contained" color="primary">
                Cadastrar
              </Button>
                 <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            color="primary"
            onClick={() => navigate("/gestor")}
          >
            Voltar
          </Button>
            </Box>
          </Paper>
        </Box>
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
