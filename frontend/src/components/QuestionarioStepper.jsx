import React, { useState } from "react";
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
  Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { Header } from "./Header";
import { Footer } from "./Footer";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const steps = ["Dados Antropométricos", "Circunferências"];

export default function QuestionarioStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);
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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  const handleToggleModal = () => setOpenModal((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundImage: 'url(/questionario.jpg)',
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

          {/* Step 1: Dados Antropométricos */}
          {activeStep === 0 && (
            <Box sx={{ display: "flex", gap: 4, width: '100%', maxWidth: 900 }}>
              {/* Modal à esquerda */}
              <Modal open={openModal} onClose={handleToggleModal}>
                <Box sx={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', width: 300, bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box component="img" src="/senior.jpg" alt="Antropometria" sx={{ width: 200, mb: 2, borderRadius: 2 }} />
                  <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Este questionário coleta dados antropométricos como peso, altura e idade. Preencha os campos ao lado para continuar.
                  </Typography>
                </Box>
              </Modal>
              {/* Card do questionário */}
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
                  <TextField label="Peso (kg)" fullWidth />
                  <TextField label="Altura (cm)" fullWidth />
                  <TextField label="Idade" fullWidth />
                  <TextField label="IMC" fullWidth />
                  <TextField label="Porcentagem de Gordura (%)" fullWidth />
                  <TextField label="Massa Muscular (kg)" fullWidth />
                  <TextField label="Gordura Visceral (%)" fullWidth />
                  <TextField label="Taxa Metabólica Basal (kcal)" fullWidth />
                  
                  <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleNext}>
                    Próximo
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Step 2: Circunferências */}
          {activeStep === 1 && (
            <Box sx={{ display: "flex", gap: 4, width: '100%', maxWidth: 900 }}>
              {/* Card do questionário */}
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
                  <TextField label="Circunferência Abdominal (cm)" fullWidth value={circData["Circunferência Abdominal (cm)"]} onChange={e => setCircData(d => ({ ...d, "Circunferência Abdominal (cm)": e.target.value }))} />
                  <TextField label="Circunferência Cintura (cm)" fullWidth value={circData["Circunferência Cintura (cm)"]} onChange={e => setCircData(d => ({ ...d, "Circunferência Cintura (cm)": e.target.value }))} />
                  <TextField label="Circunferência Quadril (cm)" fullWidth value={circData["Circunferência Quadril (cm)"]} onChange={e => setCircData(d => ({ ...d, "Circunferência Quadril (cm)": e.target.value }))} />
                  <TextField label="Circunferência Pulso (cm)" fullWidth value={circData["Circunferência Pulso (cm)"]} onChange={e => setCircData(d => ({ ...d, "Circunferência Pulso (cm)": e.target.value }))} />
                  <TextField label="Circunferência Panturrilha (cm)" fullWidth value={circData["Circunferência Panturrilha (cm)"]} onChange={e => setCircData(d => ({ ...d, "Circunferência Panturrilha (cm)": e.target.value }))} />
                  <TextField label="Circunferência Braço (cm)" fullWidth value={circData["Circunferência Braço (cm)"]} onChange={e => setCircData(d => ({ ...d, "Circunferência Braço (cm)": e.target.value }))} />
                  <TextField label="Circunferência Coxa (cm)" fullWidth value={circData["Circunferência Coxa (cm)"]} onChange={e => setCircData(d => ({ ...d, "Circunferência Coxa (cm)": e.target.value }))} />
                  <TextField label="Peso Ideal (kg)" fullWidth value={circData["Peso Ideal (kg)"]} onChange={e => setCircData(d => ({ ...d, "Peso Ideal (kg)": e.target.value }))} />
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleBack}>
                      Voltar
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => navigate('/resumo-circunferencia', { state: { dados: circData } })}>
                      Resumo
                    </Button>
                  </Box>
                </Box>
              </Paper>
              {/* Modal à direita */}
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
