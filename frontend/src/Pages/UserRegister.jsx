import React, { useState, useEffect } from "react";
import api from '../utils/api';
import axios from "axios";
import { cidadesPorEstado } from '../utils/cidadesFallback';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CssBaseline,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Divider,
  Stack
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function UserRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    motivoConsulta: "",
    estado: "",
    cidade: "",
    sexo: "",
    etnia: "",
    atividade: "",
    autorizaCadastro: false
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [cidades, setCidades] = useState([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [erroCidades, setErroCidades] = useState(false);
  const [cidadesModoOffline, setCidadesModoOffline] = useState(false);

  const navigate = useNavigate();

   const extractApiMessage = (responseData) => {
    if (!responseData) return '';
    if (typeof responseData === 'string') return responseData;
    return (
      responseData.mensagem ||
      responseData.message ||
      responseData.detalhes ||
      responseData.detail ||
      responseData.erro ||
      responseData.error ||
      responseData.title ||
      ''
    );
  };

  const applyServerError = (message) => {
    const normalized = (message || '').toLowerCase();

    if (normalized.includes('email')) {
      setErrors((prev) => ({ ...prev, email: message || 'Email já cadastrado' }));
      return true;
    }

    if (normalized.includes('cpf')) {
      setErrors((prev) => ({ ...prev, cpf: message || 'CPF já cadastrado' }));
      return true;
    }

    return false;
  };

  const estados = [
    { uf: "AC", nome: "Acre" },
    { uf: "AL", nome: "Alagoas" },
    { uf: "AP", nome: "Amapá" },
    { uf: "AM", nome: "Amazonas" },
    { uf: "BA", nome: "Bahia" },
    { uf: "CE", nome: "Ceará" },
    { uf: "DF", nome: "Distrito Federal" },
    { uf: "ES", nome: "Espírito Santo" },
    { uf: "GO", nome: "Goiás" },
    { uf: "MA", nome: "Maranhão" },
    { uf: "MT", nome: "Mato Grosso" },
    { uf: "MS", nome: "Mato Grosso do Sul" },
    { uf: "MG", nome: "Minas Gerais" },
    { uf: "PA", nome: "Pará" },
    { uf: "PB", nome: "Paraíba" },
    { uf: "PR", nome: "Paraná" },
    { uf: "PE", nome: "Pernambuco" },
    { uf: "PI", nome: "Piauí" },
    { uf: "RJ", nome: "Rio de Janeiro" },
    { uf: "RN", nome: "Rio Grande do Norte" },
    { uf: "RS", nome: "Rio Grande do Sul" },
    { uf: "RO", nome: "Rondônia" },
    { uf: "RR", nome: "Roraima" },
    { uf: "SC", nome: "Santa Catarina" },
    { uf: "SP", nome: "São Paulo" },
    { uf: "SE", nome: "Sergipe" },
    { uf: "TO", nome: "Tocantins" }
  ];

  const capitaisPorUf = {
    AC: 'Rio Branco',
    AL: 'Maceió',
    AP: 'Macapá',
    AM: 'Manaus',
    BA: 'Salvador',
    CE: 'Fortaleza',
    DF: 'Brasília',
    ES: 'Vitória',
    GO: 'Goiânia',
    MA: 'São Luís',
    MT: 'Cuiabá',
    MS: 'Campo Grande',
    MG: 'Belo Horizonte',
    PA: 'Belém',
    PB: 'João Pessoa',
    PR: 'Curitiba',
    PE: 'Recife',
    PI: 'Teresina',
    RJ: 'Rio de Janeiro',
    RN: 'Natal',
    RS: 'Porto Alegre',
    RO: 'Porto Velho',
    RR: 'Boa Vista',
    SC: 'Florianópolis',
    SP: 'São Paulo',
    SE: 'Aracaju',
    TO: 'Palmas'
  };

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

  const aplicarFallback = (uf) => {
    const cidadesLocais = cidadesPorEstado[uf] || [];
    setCidades(cidadesLocais);
    setCidadesModoOffline(cidadesLocais.length > 0);
    setErroCidades(cidadesLocais.length === 0);
  };

  const fetchCidades = async (uf) => {
    setLoadingCidades(true);
    setErroCidades(false);
    setCidadesModoOffline(false);
    try {
      const response = await axios.get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
        { timeout: 5000 }
      );
      let cidadesOrdenadas = response.data
        .map(cidade => cidade.nome)
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

      const cidadePrincipal = capitaisPorUf[uf];
      if (cidadePrincipal) {
        cidadesOrdenadas = cidadesOrdenadas.filter(cidade => cidade !== cidadePrincipal);
        cidadesOrdenadas.unshift(cidadePrincipal);
      }

      setCidades(cidadesOrdenadas);
    } catch {
      console.warn('API do IBGE indisponível, usando dados locais.');
      aplicarFallback(uf);
    } finally {
      setLoadingCidades(false);
    }
  };

  useEffect(() => {
    if (formData.estado) {
      fetchCidades(formData.estado);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (name === "cpf") {
      newValue = maskCPF(value);
    } else if (name === "phone") {
      newValue = maskPhone(value);
    } else if (name === "email") {
      newValue = value.trimStart();
    }
    
    if (name === "estado") {
      setFormData((prev) => ({
        ...prev,
        estado: newValue,
        cidade: ""
      }));
      if (newValue) {
        fetchCidades(newValue);
      } else {
        setCidades([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
    
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
    if (!formData.motivoConsulta.trim()) newErrors.motivoConsulta = "Campo obrigatório";
    if (!formData.estado) newErrors.estado = "Campo obrigatório";
    if (!formData.cidade) newErrors.cidade = "Campo obrigatório";
    if (!formData.autorizaCadastro) newErrors.autorizaCadastro = "É necessário autorizar o cadastro das informações no sistema";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const payload = {
      nome: formData.name,
      email: formData.email,
      cpf: formData.cpf,
      telefone: formData.phone,
      motivoConsulta: formData.motivoConsulta.trim(),
      cidade: formData.cidade,
      estado: formData.estado,
      sexo: formData.sexo,
      etnia: formData.etnia,
      atividade: formData.atividade
    };
    (async () => {
      try {
        const resp = await axios.post('/api/patients', {...payload, estadoCivil: 'Solteiro'}, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`
  }
});
        setNotification({
          open: true,
          message: `Sucesso! Novo usuário ${formData.name} registrado`,
          severity: 'success',
        });
        setTimeout(() => navigate("/questionario", { state: { user: resp.data } }), 1200);
      } catch (err) {
        console.error('Erro ao registrar usuário:', err);
         const status = err.response?.status;
        const msg = extractApiMessage(err.response?.data) || err.message;

        if (status === 409 && applyServerError(msg)) {
          setNotification({
            open: true,
            message: msg || 'Verifique os campos do cadastro.',
            severity: 'error',
          });
          return;
        }

        if (status === 400) {
              if ((msg || '').toLowerCase().includes('cpf')) {
                setErrors((prev) => ({ ...prev, cpf: msg || 'CPF inválido' }));
                setNotification({
                  open: true,
                  message: msg || 'CPF inválido. Verifique o número informado.',
                  severity: 'error',
                });
                return;
              }

          setNotification({
            open: true,
            message: msg || 'Dados inválidos. Verifique o preenchimento do formulário.',
            severity: 'error',
          });
          return;
        }
        setNotification({
          open: true,
          message: `Erro ao registrar usuário: ${msg || 'Erro desconhecido'}`,
          severity: 'error',
        });
      }
    })();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "88vh",
          background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)',
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
            py: 4,
          }}
        >
          <Paper 
            elevation={12} 
            sx={{ 
              p: 4, 
              maxWidth: 580, 
              width: "100%",
              borderRadius: 3
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Cadastro de Paciente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Preencha os dados do novo paciente
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name || ""}
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email || ""}
                inputProps={{ inputMode: 'email' }}
              />
              <TextField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!errors.cpf}
                helperText={errors.cpf || ""}
                inputProps={{ inputMode: 'numeric' }}
              />
              <TextField
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!errors.phone}
                helperText={errors.phone || ""}
                inputProps={{ inputMode: 'tel' }}
              />
              <TextField
                label="Motivo da consulta"
                name="motivoConsulta"
                value={formData.motivoConsulta}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!errors.motivoConsulta}
                helperText={errors.motivoConsulta || ""}
                minRows={3}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.estado}
                  helperText={errors.estado || "Selecione o estado"}
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado.uf} value={estado.uf}>
                      {estado.uf} - {estado.nome}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  helperText={
                    loadingCidades
                      ? "Carregando cidades..."
                      : erroCidades
                      ? "Sem conexão e sem dados locais para este estado."
                      : cidadesModoOffline
                      ? "Lista offline (principais cidades). Cidade não encontrada? Digite abaixo."
                      : errors.cidade || (formData.estado ? "Selecione a cidade" : "Selecione o estado primeiro")
                  }
                  error={!!errors.cidade || erroCidades}
                  disabled={!formData.estado || loadingCidades}
                >
                  {cidades.map((cidade) => (
                    <MenuItem key={cidade} value={cidade}>
                      {cidade}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                select
                label="Sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Feminino">Feminino</MenuItem>
                <MenuItem value="Outro">Outro</MenuItem>
              </TextField>

              <TextField
                select
                label="Etnia"
                name="etnia"
                value={formData.etnia}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="branca">Branca</MenuItem>
                <MenuItem value="negra">Negra</MenuItem>
                <MenuItem value="parda">Parda</MenuItem>
                <MenuItem value="indigena">Indígena</MenuItem>
                <MenuItem value="amarela">Amarela</MenuItem>
                <MenuItem value="outra">Outra</MenuItem>
              </TextField>

              <TextField
                select
                label="Nível de atividade física"
                name="atividade"
                value={formData.atividade}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="sedentário">Sedentário</MenuItem>
                <MenuItem value="levemente ativo">Levemente ativo</MenuItem>
                <MenuItem value="moderadamente ativo">Moderadamente ativo</MenuItem>
                <MenuItem value="muito ativo">Muito ativo</MenuItem>
                <MenuItem value="extremamente ativo">Extremamente ativo</MenuItem>
              </TextField>

              <Box
                sx={{
                  px: 1,
                  py: 1.5,
                  borderColor: errors.autorizaCadastro ? 'error.main' : 'divider',
                  backgroundColor: errors.autorizaCadastro ? 'rgba(211, 47, 47, 0.04)' : 'transparent'
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      name="autorizaCadastro"
                      checked={formData.autorizaCadastro}
                      onChange={handleChange}
                      color="success"
                    />
                  }
                  label="O paciente autoriza o cadastro das informações no sistema."
                  sx={{
                    alignItems: 'center',
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      lineHeight: 1.4
                    }
                  }}
                />
                {errors.autorizaCadastro && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, ml: 4.5 }}>
                    {errors.autorizaCadastro}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mt: 1 }} />
              
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="text"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/gestor")}
                  sx={{ color: 'text.secondary', fontWeight: 600 }}
                >
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="success"
                  sx={{ fontWeight: 600, px: 4 }}
                >
                  Cadastrar
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={() => setNotification({ open: false, message: "", severity: "success" })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={() => setNotification({ open: false, message: "", severity: "success"  })}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
