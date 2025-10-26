import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
 

const steps = ["Dados Antropométricos", "Circunferências"];

const calculateIMC = (weight, heightCm) => {
  const heightM = heightCm / 100;
  if (weight > 0 && heightM > 0) {
    const imc = weight / (heightM * heightM);
    return imc.toFixed(2).replace('.', ',');
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
  const [saveToastOpen, setSaveToastOpen] = useState(false);
  const hydrationRef = React.useRef(false);
  const debounceRef = React.useRef(null);
  const persistData = React.useCallback((uid, aData, cData, comp) => {
    if (!uid) return;
    try {
      const payload = { antropoData: aData, circData: cData, completed: comp };
      localStorage.setItem(`questionario_${uid}`, JSON.stringify(payload));
    } catch {}
  }, []);
  const location = useLocation();
  const mockUsers = [
    { id: 1, name: "André Goulart", email: "andre.goulart@example.com", phone: "(11) 98765-4321", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", phone: "(21) 91234-5678", avatar: "https://i.pravatar.cc/150?img=2" },
  ];
  const selectedUser = location.state?.user || mockUsers[0];
  const [userInfo, setUserInfo] = useState(selectedUser);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userDraft, setUserDraft] = useState({
    name: selectedUser?.name || '',
    email: selectedUser?.email || '',
    phone: selectedUser?.phone || selectedUser?.telefone || '',
    avatar: selectedUser?.avatar || ''
  });
  const [antropoData, setAntropoData] = useState(() => ({
    peso: location.state?.antropoData?.peso ?? "",
    altura: location.state?.antropoData?.altura ?? "",
    idade: location.state?.antropoData?.idade ?? "",
    porcentagemGordura: location.state?.antropoData?.porcentagemGordura ?? "",
    massaMuscular: location.state?.antropoData?.massaMuscular ?? "",
    gorduraVisceral: location.state?.antropoData?.gorduraVisceral ?? "",
    taxaMetabolicaBasal: location.state?.antropoData?.taxaMetabolicaBasal ?? ""
  }));
  const [circData, setCircData] = useState(() => ({
    "Circunferência Abdominal (cm)": location.state?.dados?.["Circunferência Abdominal (cm)"] ?? "",
    "Circunferência Cintura (cm)": location.state?.dados?.["Circunferência Cintura (cm)"] ?? "",
    "Circunferência Quadril (cm)": location.state?.dados?.["Circunferência Quadril (cm)"] ?? "",
    "Circunferência Pulso (cm)": location.state?.dados?.["Circunferência Pulso (cm)"] ?? "",
    "Circunferência Panturrilha (cm)": location.state?.dados?.["Circunferência Panturrilha (cm)"] ?? "",
    "Circunferência Braço (cm)": location.state?.dados?.["Circunferência Braço (cm)"] ?? "",
    "Circunferência Coxa (cm)": location.state?.dados?.["Circunferência Coxa (cm)"] ?? "",
    "Peso Ideal (kg)": location.state?.dados?.["Peso Ideal (kg)"] ?? ""
  }));
  
  useEffect(() => {
    if (!selectedUser?.id) return;
    try { localStorage.setItem('lastUserId', String(selectedUser.id)); } catch {}
    const stored = localStorage.getItem(`questionario_${selectedUser.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.antropoData) setAntropoData(prev => ({ ...prev, ...parsed.antropoData }));
        if (parsed.circData) setCircData(prev => ({ ...prev, ...parsed.circData }));
        if (parsed.completed) setCompleted(parsed.completed);
      } catch {}
    }
    // Marcar hidratação como concluída após um pequeno delay (evita toast na restauração inicial)
    hydrationRef.current = false;
    const t = setTimeout(() => { hydrationRef.current = true; }, 800);
    return () => clearTimeout(t);
  }, [selectedUser?.id]);

  useEffect(() => {
    if (!selectedUser?.id) return;
    const payload = { antropoData, circData, completed };
    localStorage.setItem(`questionario_${selectedUser.id}`, JSON.stringify(payload));
  }, [selectedUser?.id, antropoData, circData, completed]);

  // Exibe toast "Dados salvos" quando os dados mudarem (evita exibir na hidratação inicial)
  useEffect(() => {
    if (!hydrationRef.current) return; // não mostrar na primeira carga
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSaveToastOpen(true);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [antropoData, circData]);
  const navigate = useNavigate();

  const imc = useMemo(() => {
    const pStr = (antropoData.peso ?? '').toString();
    const aStr = (antropoData.altura ?? '').toString();
    const peso = parseFloat(pStr.replace(',', '.'));
    const altura = parseFloat(aStr.replace(',', '.'));
    if (!Number.isFinite(peso) || !Number.isFinite(altura)) return '';
    return calculateIMC(peso, altura);
  }, [antropoData.peso, antropoData.altura]);

  const startEditUser = () => setIsEditingUser(true);
  const cancelEditUser = () => {
    setIsEditingUser(false);
    setUserDraft({
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || userInfo?.telefone || '',
      avatar: userInfo?.avatar || ''
    });
  };
  const saveEditUser = () => {
    const updated = {
      ...userInfo,
      name: userDraft.name,
      email: userDraft.email,
      phone: userDraft.phone,
      telefone: userDraft.phone,
      avatar: userDraft.avatar || null,
    };
    setUserInfo(updated);
    setIsEditingUser(false);
    try {
      const stored = localStorage.getItem('users');
      const arr = stored ? JSON.parse(stored) : [];
      if (Array.isArray(arr)) {
        const idx = arr.findIndex(u => u.id === updated.id);
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], ...updated };
        } else if (updated?.id) {
          arr.push(updated);
        }
        localStorage.setItem('users', JSON.stringify(arr));
      }
    } catch {}
  };
  const onChangeDraft = (field) => (e) => {
    setUserDraft(prev => ({ ...prev, [field]: e.target.value }));
  };
  const fileInputRef = React.useRef(null);
  const handlePickImage = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUserDraft(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAntropoChange = (field) => (event) => {
    const inputValue = event.target.value;
    const numericFields = ['peso', 'altura', 'idade', 'porcentagemGordura', 'massaMuscular', 'gorduraVisceral', 'taxaMetabolicaBasal'];
    if (numericFields.includes(field)) {
      const sanitizedValue = numericInputHandler(inputValue);
      if (sanitizedValue !== null) {
        setAntropoData(d => {
          const next = { ...d, [field]: sanitizedValue };
          persistData(selectedUser?.id, next, circData, completed);
          return next;
        });
      }
    } else {
      setAntropoData(d => {
        const next = { ...d, [field]: inputValue };
        persistData(selectedUser?.id, next, circData, completed);
        return next;
      });
    }
  };

  const handleCircChange = (field) => (event) => {
    const inputValue = event.target.value;
    const sanitizedValue = numericInputHandler(inputValue);
    if (sanitizedValue !== null) {
      setCircData(d => {
        const next = { ...d, [field]: sanitizedValue };
        persistData(selectedUser?.id, antropoData, next, completed);
        return next;
      });
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
    navigate('/resumo-circunferencia', { state: { dados: circData, antropoData, user: selectedUser } });
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
          background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)',
        }}
      >
        <Box sx={{mt: 8, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4, width: '100%', maxWidth: 600 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ display: "flex", gap: 4, marginRight: '340px', width: '100%', maxWidth: 1200, justifyContent: 'center' }}>
              <Paper elevation={3} sx={{ width: 340, p: 2, borderRadius: 3, alignSelf: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar src={userInfo?.avatar || undefined} sx={{ width: 56, height: 56, border: '2px solid #2e7d32' }}>
                    {(!userInfo?.avatar && userInfo?.name) ? userInfo.name.charAt(0) : null}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    {!isEditingUser ? (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{userInfo?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{userInfo?.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{userInfo?.phone || userInfo?.telefone}</Typography>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField size="small" label="Nome" value={userDraft.name} onChange={onChangeDraft('name')} />
                        <TextField size="small" label="Email" value={userDraft.email} onChange={onChangeDraft('email')} />
                        <TextField size="small" label="Telefone" value={userDraft.phone} onChange={onChangeDraft('phone')} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField size="small" label="URL da imagem" value={userDraft.avatar} onChange={onChangeDraft('avatar')} fullWidth />
                          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                          <Tooltip title="Enviar foto">
                            <IconButton size="small" onClick={handlePickImage}><PhotoCamera fontSize="small" /></IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <Box>
                    {!isEditingUser ? (
                      <Tooltip title="Editar usuário">
                        <IconButton size="small" onClick={startEditUser}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Salvar">
                          <IconButton size="small" color="success" onClick={saveEditUser}><CheckIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton size="small" color="error" onClick={cancelEditUser}><CloseIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </Box>
                    )}
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
              <Paper elevation={4} sx={{ flex: 1, p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Dados Antropométricos</Typography>
                </Box>
                <Box component="form" sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
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
                  <Grid container spacing={2} sx={{ ml: 23, justifyContent: 'center' }}>
                    <Grid item xs={6}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth
                        onClick={() => navigate('/register')}
                      >
                        Voltar
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        onClick={() => {
                          const newCompleted = { ...completed, antropo: true };
                          setCompleted(newCompleted);
                          persistData(selectedUser?.id, antropoData, circData, newCompleted);
                          handleNext();
                        }}
                      >
                        Próximo
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
              {openModal && (
                <Paper elevation={3} sx={{ width: 320, marginLeft: '340px', p: 2, borderRadius: 3, alignSelf: 'flex-start' }}>
                  <Box component="img" src="/senior.jpg" alt="Ajuda - Antropometria" sx={{ width: '100%', borderRadius: 2, mb: 2 }} />
                  <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Este questionário coleta dados antropométricos como peso, altura e idade. Preencha os campos para prosseguir.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ display: "flex", gap: 4, marginRight: '340px', width: '100%', maxWidth: 1200, justifyContent: 'center' }}>
              <Paper elevation={3} sx={{ width: 340, p: 2, borderRadius: 3, alignSelf: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar src={userInfo?.avatar || undefined} sx={{ width: 56, height: 56, border: '2px solid #2e7d32' }}>
                    {(!userInfo?.avatar && userInfo?.name) ? userInfo.name.charAt(0) : null}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    {!isEditingUser ? (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{userInfo?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{userInfo?.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{userInfo?.phone || userInfo?.telefone}</Typography>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField size="small" label="Nome" value={userDraft.name} onChange={onChangeDraft('name')} />
                        <TextField size="small" label="Email" value={userDraft.email} onChange={onChangeDraft('email')} />
                        <TextField size="small" label="Telefone" value={userDraft.phone} onChange={onChangeDraft('phone')} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField size="small" label="URL da imagem" value={userDraft.avatar} onChange={onChangeDraft('avatar')} fullWidth />
                          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                          <Tooltip title="Enviar foto">
                            <IconButton size="small" onClick={handlePickImage}><PhotoCamera fontSize="small" /></IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <Box>
                    {!isEditingUser ? (
                      <Tooltip title="Editar usuário">
                        <IconButton size="small" onClick={startEditUser}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Salvar">
                          <IconButton size="small" color="success" onClick={saveEditUser}><CheckIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton size="small" color="error" onClick={cancelEditUser}><CloseIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </Box>
                    )}
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
              <Paper elevation={4} sx={{ flex: 1, p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Dados de Circunferência</Typography>
                </Box>
                <Box component="form" sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
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
                  <Grid container spacing={2} sx={{ ml: 23, justifyContent: 'center' }}>
                    <Grid item xs={6}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth
                        onClick={handleBack}
                      >
                        Voltar
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        onClick={() => {
                          const newCompleted = { ...completed, circ: true };
                          setCompleted(newCompleted);
                          persistData(selectedUser?.id, antropoData, circData, newCompleted);
                          handleResumoClick();
                        }}
                      >
                        Ver resultado
                      </Button>
                    </Grid>
                  </Grid>
     
                </Box>
              </Paper>
              {openModal && (
                <Paper elevation={3} sx={{ width: 320, p: 2, borderRadius: 3, alignSelf: 'flex-start' }}>
                  <Box component="img" src="/medida.jpg" alt="Ajuda - Circunferências" sx={{ width: '100%', borderRadius: 2, mb: 2 }} />
                  <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Este questionário coleta dados de circunferências corporais. Preencha os campos para prosseguir.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar
      open={saveToastOpen}
      autoHideDuration={1500}
      onClose={() => setSaveToastOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          Dados salvos
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}