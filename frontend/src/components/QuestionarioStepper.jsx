import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Modal,
  TextField,
  IconButton,
  Tooltip,
  Grid
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { Header } from "./Header";
import { Footer } from "./Footer";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const steps = ["Dados Antropométricos", "Circunferências"];

const calculateIMC = (weight, heightCm) => {
  const heightM = heightCm / 100;
  if (weight > 0 && heightM > 0) {
    const imc = weight / (heightM * heightM);
    return imc.toFixed(2);
  }
  return "";
};

const numericInputHandler = (value) => {
  let sanitizedValue = value.replace(',', '.');
  const regex = /^\d*\.?\d*$/; 
  if (regex.test(sanitizedValue) || sanitizedValue === '') {
    return sanitizedValue;
  }
  return null; 
};

export default function QuestionarioStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [completed, setCompleted] = useState({ antropo: false, circ: false });
  const location = useLocation();
  const mockUsers = [
    { id: 1, name: "André Goulart", email: "andre.goulart@example.com", phone: "(11) 98765-4321", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", phone: "(21) 91234-5678", avatar: "https://i.pravatar.cc/150?img=2" },
  ];
  const selectedUser = location.state?.user || mockUsers[0];
  const [antropoData, setAntropoData] = useState({
    peso: "",
    altura: "",
    idade: "",
    porcentagemGordura: "",
    massaMuscular: "",
    gorduraVisceral: "",
    taxaMetabolicaBasal: ""
  });
  const [circData, setCircData] = useState({
    "Circunferência Abdominal (cm)": "",
    "Circunferência Cintura (cm)": "",
    "Circunferência Quadril (cm)": "",
    "Circunferência Pulso (cm)": "",
    "Circunferência Panturrilha (cm)": "",
    "Circunferência Braço (cm)": "",
    "Circunferência Coxa (cm)": "",
    "Peso Ideal (kg)": ""
  });
  const navigate = useNavigate();

  const imc = useMemo(() => {
    const peso = parseFloat(antropoData.peso.replace(',', '.'));
    const altura = parseFloat(antropoData.altura.replace(',', '.'));
    return calculateIMC(peso, altura);
  }, [antropoData.peso, antropoData.altura]);

  const handleAntropoChange = (field) => (event) => {
    const inputValue = event.target.value;
    const numericFields = ['peso', 'altura', 'idade', 'porcentagemGordura', 'massaMuscular', 'gorduraVisceral', 'taxaMetabolicaBasal'];
    if (numericFields.includes(field)) {
      const sanitizedValue = numericInputHandler(inputValue);
      if (sanitizedValue !== null) {
        setAntropoData(d => ({ ...d, [field]: sanitizedValue }));
      }
    } else {
      setAntropoData(d => ({ ...d, [field]: inputValue }));
    }
  };

  const handleCircChange = (field) => (event) => {
    const inputValue = event.target.value;
    const sanitizedValue = numericInputHandler(inputValue);
    if (sanitizedValue !== null) {
      setCircData(d => ({ ...d, [field]: sanitizedValue }));
    }
  };
  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  const handleToggleModal = () => setOpenModal((prev) => !prev);

  const handleResumoClick = () => {
    setCompleted((prev) => ({ ...prev, circ: true }));
    navigate('/resumo-circunferencia', { state: { dados: circData } });
  };

  const antropoFields = [
    { label: "Peso (kg)", field: "peso" },
    { label: "Altura (cm)", field: "altura" },
    { label: "IMC", field: "imc", isCalculated: true },
    { label: "Idade", field: "idade" },
    { label: "Porcentagem de Gordura (%)", field: "porcentagemGordura" },
    { label: "Massa Muscular (kg)", field: "massaMuscular" },
    { label: "Gordura Visceral (%)", field: "gorduraVisceral" },
    { label: "Taxa Metabólica Basal (kcal)", field: "taxaMetabolicaBasal" },
  ];

  const circFields = [
    "Circunferência Abdominal (cm)",
    "Circunferência Cintura (cm)",
    "Circunferência Quadril (cm)",
    "Circunferência Pulso (cm)",
    "Circunferência Panturrilha (cm)",
    "Circunferência Braço (cm)",
    "Circunferência Coxa (cm)",
    "Peso Ideal (kg)"
  ];
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundImage: 'url(/verde.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Header />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4, width: '100%', maxWidth: 600 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ display: "flex", gap: 4, width: '100%', maxWidth: 1200 }}>
              <Modal open={openModal} onClose={handleToggleModal}>
                <Box sx={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', width: 300, bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box component="img" src="/senior.jpg" alt="Antropometria" sx={{ width: 200, mb: 2, borderRadius: 2 }} />
                  <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Este questionário coleta dados antropométricos como peso, altura e idade. Preencha os campos ao lado para continuar.
                  </Typography>
                </Box>
              </Modal>
              <Paper elevation={4} sx={{ flex: 1, p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Dados Antropométricos</Typography>
                  <Tooltip title="Ajuda sobre dados antropométricos">
                    <IconButton onClick={handleToggleModal} sx={{ ml: 1, backgroundColor: '#e0e0e0', color: '#555', width: 32, height: 32 }}>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {antropoFields.map((item) => (
                    <TextField 
                      key={item.field}
                      label={item.label} 
                      fullWidth
                      value={item.isCalculated ? imc : antropoData[item.field]}
                      disabled={item.isCalculated}
                      onChange={!item.isCalculated ? handleAntropoChange(item.field) : undefined}
                      type="text" 
                      inputProps={{
                        pattern: "[0-9]*[.,]?[0-9]*" 
                      }}
                    />
                  ))}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth
                        onClick={() => navigate('/')}
                      >
                        Voltar
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        onClick={() => { setCompleted((p) => ({ ...p, antropo: true })); handleNext(); }}
                      >
                        Próximo
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
                <Paper elevation={3} sx={{ width: 320, p: 2, borderRadius: 3, alignSelf: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box component="img" src={selectedUser.avatar} alt={selectedUser.name} sx={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #2e7d32' }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selectedUser.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedUser.phone}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Informações preenchidas</Typography>
                  <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                    {!!antropoData.peso && <Typography variant="body2">Peso: {antropoData.peso} kg</Typography>}
                    {!!antropoData.altura && <Typography variant="body2">Altura: {antropoData.altura} cm</Typography>}
                    {!!antropoData.idade && <Typography variant="body2">Idade: {antropoData.idade}</Typography>}
                    {!!imc && <Typography variant="body2">IMC: {imc}</Typography>}
                    {!!antropoData.porcentagemGordura && <Typography variant="body2">Gordura: {antropoData.porcentagemGordura} %</Typography>}
                    {!!antropoData.massaMuscular && <Typography variant="body2">Massa Muscular: {antropoData.massaMuscular} kg</Typography>}
                    {!!antropoData.gorduraVisceral && <Typography variant="body2">Gordura Visceral: {antropoData.gorduraVisceral} %</Typography>}
                    {!!antropoData.taxaMetabolicaBasal && <Typography variant="body2">TMB: {antropoData.taxaMetabolicaBasal} kcal</Typography>}
                    {Object.entries(circData).map(([k,v]) => (
                      v ? <Typography key={k} variant="body2">{k}: {v}</Typography> : null
                    ))}
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: completed.antropo ? 'green' : 'grey.400' }} />
                      <Typography variant="body2">Dados Antropométricos</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: completed.circ ? 'green' : 'grey.400' }} />
                      <Typography variant="body2">Dados de Circunferência</Typography>
                    </Box>
                  </Box>
                </Paper>
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ display: "flex", gap: 4, width: '100%', maxWidth: 1200 }}>
              <Paper elevation={4} sx={{ flex: 1, p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Dados de Circunferência</Typography>
                  <Tooltip title="Ajuda sobre dados de circunferência">
                    <IconButton onClick={handleToggleModal} sx={{ ml: 1, backgroundColor: '#e0e0e0', color: '#555', width: 32, height: 32 }}>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {circFields.map((label) => (
                    <TextField 
                      key={label}
                      label={label} 
                      fullWidth 
                      value={circData[label]} 
                      onChange={handleCircChange(label)}
                      type="text" 
                      inputProps={{
                        pattern: "[0-9]*[.,]?[0-9]*"
                      }}
                    />
                  ))}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        onClick={handleBack}
                      >
                        Voltar
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        fullWidth
                        onClick={handleResumoClick}
                      >
                        Resumo
                      </Button>
                    </Grid>
                  </Grid>
                  
                </Box>
              </Paper>
              <Paper elevation={3} sx={{ width: 320, p: 2, borderRadius: 3, alignSelf: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box component="img" src={selectedUser.avatar} alt={selectedUser.name} sx={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #2e7d32' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selectedUser.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.phone}</Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Informações preenchidas</Typography>
                <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                  {!!antropoData.peso && <Typography variant="body2">Peso: {antropoData.peso} kg</Typography>}
                  {!!antropoData.altura && <Typography variant="body2">Altura: {antropoData.altura} cm</Typography>}
                  {!!antropoData.idade && <Typography variant="body2">Idade: {antropoData.idade}</Typography>}
                  {!!imc && <Typography variant="body2">IMC: {imc}</Typography>}
                  {!!antropoData.porcentagemGordura && <Typography variant="body2">Gordura: {antropoData.porcentagemGordura} %</Typography>}
                  {!!antropoData.massaMuscular && <Typography variant="body2">Massa Muscular: {antropoData.massaMuscular} kg</Typography>}
                  {!!antropoData.gorduraVisceral && <Typography variant="body2">Gordura Visceral: {antropoData.gorduraVisceral} %</Typography>}
                  {!!antropoData.taxaMetabolicaBasal && <Typography variant="body2">TMB: {antropoData.taxaMetabolicaBasal} kcal</Typography>}
                  {Object.entries(circData).map(([k,v]) => (
                    v ? <Typography key={k} variant="body2">{k}: {v}</Typography> : null
                  ))}
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: completed.antropo ? 'green' : 'grey.400' }} />
                    <Typography variant="body2">Dados Antropométricos</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: completed.circ ? 'green' : 'grey.400' }} />
                    <Typography variant="body2">Dados de Circunferência</Typography>
                  </Box>
                </Box>
              </Paper>
              <Modal open={openModal} onClose={handleToggleModal}>
                <Box sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: 300, bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box component="img" src="/medida.jpg" alt="Circunferência" sx={{ width: 200, mb: 2, borderRadius: 2 }} />
                  <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Este questionário coleta dados de circunferências corporais. Preencha os campos ao lado para continuar.
                  </Typography>
                </Box>
              </Modal>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}