import React, { useEffect, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import api from '../utils/api';
import { useNavigate, useLocation } from "react-router-dom";
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
  DialogContentText,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const defaultUsers = [
  { id: 1, name: "André Goulart", email: "andre.goulart@example.com", telefone: "(11) 98765-4321", cidade: "São Paulo", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", telefone: "(21) 91234-5678", cidade: "Rio de Janeiro", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Pedro Henrique", email: "pedro.henrique@example.com", telefone: "(31) 99876-5432", cidade: "Belo Horizonte", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Julia Carvalho", email: "julia.carvalho@example.com", telefone: "(41) 98765-1234", cidade: "Curitiba", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 5, name: "Lucas Oliveira", email: "lucas.oliveira@example.com", telefone: "(51) 91234-8765", cidade: "Porto Alegre", avatar: "https://i.pravatar.cc/150?img=4" },
];

export default function UserGestor() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleUser, setScheduleUser] = useState(null);
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("09:00");
  const [apptNote, setApptNote] = useState("");
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  // Busca userId do state, sessionStorage ou localStorage
  const location = useNavigate ? useLocation() : {};
  let userId = location?.state?.user?.id;
  if (!userId) {
    userId = sessionStorage.getItem('idUsuario') || localStorage.getItem('idUsuario');
    if (userId) userId = parseInt(userId, 10);
  }
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [startAppointment, setStartAppointment] = useState(null); 
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  
  const circKeys = [
    "Circunferência Abdominal (cm)",
    "Circunferência Cintura (cm)",
    "Circunferência Quadril (cm)",
    "Circunferência Pulso (cm)",
    "Circunferência Panturrilha (cm)",
    "Circunferência Braço (cm)",
    "Circunferência Coxa (cm)",
    "Peso Ideal (kg)"
  ];
  const initialCirc = circKeys.reduce((acc, k) => ({ ...acc, [k]: "" }), {});
  const computeImc = (peso, altura) => {
    const p = parseFloat(String(peso).replace(',', '.'));
    const h = parseFloat(String(altura).replace(',', '.'));
    if (!p || !h) return "";
    const hm = h / 100;
    const imc = p / (hm * hm);
    return Number.isFinite(imc) ? imc.toFixed(1) : "";
  };

  const sidebarWidth = 120;

  const [updateForm, setUpdateForm] = useState({
    id: null,
    name: "",
    peso: "",
    altura: "",
    idadeMetabolica: "",
    massaMuscular: "",
    porcentagemGordura: "",
    gorduraVisceral: "",
    circ: { ...initialCirc },
    date: "" 
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = () => {
      const stored = localStorage.getItem("users");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUsers(Array.isArray(parsed) ? parsed : defaultUsers);
        } catch {
          setUsers(defaultUsers);
        }
      } else {
        setUsers(defaultUsers);
        localStorage.setItem("users", JSON.stringify(defaultUsers));
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await api.get('/schedulings');
        const list = Array.isArray(res.data) ? res.data : [];
        const mapped = list.map((a) => ({
          id: a.id,
          userId: a.pacienteId ?? a.usuarioId ?? null,
          userName: a.pacienteNome ?? "",
          nutricionistaName: a.nutricionistaNome ?? "",
          date: a.dataAgendada ?? "",
          time: "09:00",
          note: a.observacoes ?? "",
        }));
        setAppointments(mapped);
        try { localStorage.setItem("appointments", JSON.stringify(mapped)); } catch {}
      } catch (e) {
        console.error("Erro ao carregar agendamentos:", e);
        try {
          const stored = localStorage.getItem("appointments");
          if (stored) setAppointments(JSON.parse(stored));
        } catch {}
      }
    };
    loadAppointments();
  }, []);
  const fetchUsers = async () => {
    try {
      const response = await api.get('/patients');
      const mapped = Array.isArray(response.data)
        ? response.data.map(u => ({
            id: u.id ?? u.ID ?? u.idUsuario ?? u.codigo ?? undefined,
            name: u.name ?? u.nome ?? '',
            email: u.email ?? '',
            telefone: u.telefone ?? u.phone ?? '',
            cidade: u.cidade ?? u.city ?? '',
            avatar: u.avatar ?? '',
            cpf: u.cpf ?? '',
            crn: u.crn ?? '',
          }))
        : [];
      setUsers(mapped);
      try { localStorage.setItem("users", JSON.stringify(mapped)); } catch {}
    } catch (error) {
      // fallback to stored users or defaults
      const stored = localStorage.getItem("users");
      if (stored) {
        try {
          setUsers(JSON.parse(stored));
        } catch {
          setUsers([]);
        }
      } else {
        setUsers(defaultUsers);
        try { localStorage.setItem("users", JSON.stringify(defaultUsers)); } catch {}
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUsers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
  const handleAddUser = () => {
    navigate("/register-patient");
  };

  const openScheduleDialog = (user) => {
    setScheduleUser(user);
    setApptDate("");
    setApptTime("09:00");
    setApptNote("");
    setScheduleOpen(true);
  };
  const closeScheduleDialog = () => setScheduleOpen(false);

  
  const getNextAppointment = (user) => {
    const list = appointments
      .filter(a => a.userId === user.id)
      .sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
    return list.length ? list[0] : null;
  };

  const hasAppointment = (user) => !!getNextAppointment(user);


  const openStartConsultation = (user) => {
    const appt = getNextAppointment(user);
    if (!appt) return;
    setStartAppointment(appt);
    setStartDialogOpen(true);
  };
  const closeStartConsultation = () => {
    setStartAppointment(null);
    setStartDialogOpen(false);
  };

  const openUpdateData = async () => {
    if (!startAppointment) return;
    const userFromList = users.find(u => u.id === startAppointment.userId) || {};
    setUpdateForm(prev => ({
      ...prev,
      id: userFromList.id ?? startAppointment.userId,
      name: userFromList.name ?? "",
      peso: userFromList.peso ?? "",
      altura: userFromList.altura ?? "",
      idadeMetabolica: userFromList.idadeMetabolica ?? "",
      massaMuscular: userFromList.massaMuscular ?? "",
      porcentagemGordura: userFromList.porcentagemGordura ?? "",
      gorduraVisceral: userFromList.gorduraVisceral ?? "",
      circ: { ...initialCirc, ...(userFromList.circ || {}) },
      date: startAppointment.date || ""
    }));
     
     try {
       const res = await fetch(`/api/appointments/${startAppointment.id}/history`); // vamos trocar pelo nosso endpoint
       if (res.ok) {
         const data = await res.json();
         setUpdateForm(prev => ({
           ...prev,
           date: data.date || prev.date,
           peso: data.peso ?? prev.peso,
           altura: data.altura ?? prev.altura,
           idadeMetabolica: data.idadeMetabolica ?? prev.idadeMetabolica,
           massaMuscular: data.massaMuscular ?? prev.massaMuscular,
           porcentagemGordura: data.porcentagemGordura ?? prev.porcentagemGordura,
           gorduraVisceral: data.gorduraVisceral ?? prev.gorduraVisceral,
           circ: { ...prev.circ, ...(data.circ || {}) }
         }));
       }
     } catch (e) {
     setUpdateDialogOpen(true);
   };}

  const closeUpdateData = () => setUpdateDialogOpen(false);

  
  const saveUpdateData = async () => {
  if (!startAppointment) return;

  if (!updateForm.date) {
    alert("Data é obrigatória para gerar a dashboard.");
    return;
  }

  const pacienteId = updateForm.id;

  const payload = {
    dataConsulta: updateForm.date,
    antropometria: {
      peso: Number(updateForm.peso),
      altura: Number(updateForm.altura),
      imc: Number(computeImc(updateForm.peso, updateForm.altura)),
      idadeMetabolica: Number(updateForm.idadeMetabolica),
      massaMuscular: Number(updateForm.massaMuscular),
      gorduraVisceral: Number(updateForm.gorduraVisceral),
      porcentagemGordura: Number(updateForm.porcentagemGordura),
    },
    circunferencia: {
      abdominal: Number(updateForm.circ["Circunferência Abdominal (cm)"]),
      cintura: Number(updateForm.circ["Circunferência Cintura (cm)"]),
      quadril: Number(updateForm.circ["Circunferência Quadril (cm)"]),
      pulso: Number(updateForm.circ["Circunferência Pulso (cm)"]),
      panturrilha: Number(updateForm.circ["Circunferência Panturrilha (cm)"]),
      braco: Number(updateForm.circ["Circunferência Braço (cm)"]),
      coxa: Number(updateForm.circ["Circunferência Coxa (cm)"]),
      pesoIdeal: Number(updateForm.circ["Peso Ideal (kg)"]),
    }
  };

  try {
    await api.post(`/patient-history/${pacienteId}`, payload);
  } catch (error) {
    console.error("Erro ao salvar consulta:", error);
    alert("Erro ao salvar os dados da consulta.");
    return;
  }

  const updatedUser = {
    id: updateForm.id,
    name: updateForm.name,
    peso: updateForm.peso,
    altura: updateForm.altura,
    idadeMetabolica: updateForm.idadeMetabolica,
    massaMuscular: updateForm.massaMuscular,
    porcentagemGordura: updateForm.porcentagemGordura,
    gorduraVisceral: updateForm.gorduraVisceral,
    circ: updateForm.circ,
    imc: computeImc(updateForm.peso, updateForm.altura)
  };

  setUsers(prev => {
    const found = prev.some(u => u.id === updatedUser.id);
    const next = found
      ? prev.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      : [...prev, updatedUser];

    try {
      localStorage.setItem('users', JSON.stringify(next));
    } catch {}

    return next;
  });

  setUpdateDialogOpen(false);
  setStartDialogOpen(false);

  
};

  const handlePlanDiet = () => {
    if (!startAppointment) return;
    const user = users.find(u => u.id === startAppointment.userId);
    const patientName = startAppointment.userName || user?.name || 'Paciente';
    closeStartConsultation();
    navigate("/diet", { 
      state: { 
        user: user || { id: startAppointment.userId, name: patientName },
        patientName,
        appointment: startAppointment
      } 
    });
  };

  const openWeekDialog = () => setWeekDialogOpen(true);
  const closeWeekDialog = () => setWeekDialogOpen(false);
  
  const startOfWeek = (d = new Date()) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(date.setDate(diff));
    start.setHours(0,0,0,0);
    return start;
  };

  const weeklyAppointments = (() => {
    const start = startOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return appointments.filter(a => {
      const d = new Date(a.date);
      return d >= start && d < end;
    }).sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
  })();

  const requestDeleteUser = (user) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    const uid = userToDelete.id;
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== uid);
      try {
        localStorage.setItem("users", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      localStorage.removeItem(`questionario_${uid}`);
    } catch {}
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    const onFocus = () => {
      const stored = localStorage.getItem("users");
      if (stored) {
        try {
          setUsers(JSON.parse(stored));
        } catch {}
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const raw =
      user[filterType] ||
      (filterType === "telefone" ? user.telefone || user.phone : undefined);
    const value = raw?.toString().toLowerCase();
    return value && value.includes(term);
  });

  const saveAppointment = async () => {
    if (!scheduleUser || !apptDate) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
  
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para agendar consultas.');
      return;
    }
  
    try {
      const usuarioIdStr = sessionStorage.getItem('idUsuario') || localStorage.getItem('idUsuario');
      const usuarioId = usuarioIdStr ? parseInt(usuarioIdStr, 10) : null;
      const pacienteId = scheduleUser?.id ? parseInt(scheduleUser.id, 10) : 1;
    
      if (!usuarioId || !pacienteId) {
        alert('Erro ao identificar paciente ou nutricionista.');
        return;
      }

      const payload = {
        pacienteId,
        usuarioId,
        dataAgendada: apptDate,
        observacoes: apptNote || ""
      };

      console.log('Payload sendo enviado:', payload);
      console.log('Token:', token);

      const response = await api.post('/schedulings', payload);
    
      const appt = {
        id: response.data.id,
        userId: pacienteId,
        userName: response.data.pacienteNome,
        nutricionistaName: response.data.nutricionistaNome,
        date: response.data.dataAgendada,
        time: apptTime,
        note: response.data.observacoes || "",
      };
    
      setAppointments(prev => {
        const next = [...prev, appt];
        try { localStorage.setItem("appointments", JSON.stringify(next)); } catch {}
        return next;
      });
    
      setScheduleOpen(false);
      setSnackbar({ open: true, message: 'Agendamento criado com sucesso!', severity: 'success' });
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Request headers:', error.config?.headers);
    
      if (error.response?.status === 401) {
        setSnackbar({ open: true, message: 'A observação precisa ser preenchida.', severity: 'error' });
      } else if (error.response?.status === 400) {
        setSnackbar({ open: true, message: `Dados inválidos: ${JSON.stringify(error.response.data)}`, severity: 'error' });
      } else if (error.response?.status === 404) {
        setSnackbar({ open: true, message: 'Paciente ou nutricionista não encontrado no sistema.', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Erro ao criar agendamento. Verifique o console para mais detalhes.', severity: 'error' });
      }
    }
  };

  return (
    <>
      <CssBaseline />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ bgcolor: snackbar.severity === 'success' ? '#43a047' : '#d32f2f', color: 'white', px: 3, py: 1.5, borderRadius: 2, boxShadow: 3, fontWeight: 500, fontSize: '1rem' }}>
          {snackbar.message}
        </Box>
      </Snackbar>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "88vh" }}>
        


        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            p: 3,
            background: "linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)",
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 1200,
              borderRadius: "20px",
              p: 2,
              boxShadow: 3,
              maxHeight: 600,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5">Gerenciamento de pacientes</Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Button
              onClick={openWeekDialog}
              variant="contained"
              startIcon={
                <Box sx={{ bgcolor: "#fff", borderRadius: "50%", p: 0.7, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  <CalendarTodayIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
                </Box>
              }
              sx={{
                height: 56,
                borderRadius: 8,
                bgcolor: "linear-gradient(180deg, #2e7d32, #256026)",
                color: "#fff",
                boxShadow: "0 10px 30px rgba(46,125,50,0.12)",
                textTransform: "none",
                display: "flex",
                alignItems: "center",
                "&:hover": { bgcolor: "#27692c", boxShadow: "0 12px 34px rgba(38,114,44,0.14)" }
              }}
            >
              Consultas
            </Button>
               <TextField
                 select
                 size="small"
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
                 InputProps={{
                   startAdornment: (
                     <InputAdornment position="start">
                       <FilterListIcon />
                     </InputAdornment>
                   ),
                 }}
               >
                 <MenuItem value="name">Nome</MenuItem>
                 <MenuItem value="email">Email</MenuItem>
                 <MenuItem value="telefone">Telefone</MenuItem>
                 <MenuItem value="cidade">Cidade</MenuItem>
               </TextField>

                <TextField
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
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddUser}
                  sx={{ backgroundColor: "#2e7d32", borderRadius: "15px" }}
                >
                  Adicionar paciente
                </Button>
              </Box>
            </Box>

            <List sx={{ flex: 1, overflowY: "auto" }}>
              {filteredUsers.map((user, index) => (
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
                          <Button variant="outlined" size="small" onClick={() => openScheduleDialog(user)}>
                            AGENDAR CONSULTA
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

                  {index < filteredUsers.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <Typography>Deseja excluir esse usuário?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={scheduleOpen} onClose={closeScheduleDialog}>
        <DialogTitle>Agendar Consulta</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 320 }}>
          <TextField label="Paciente" value={scheduleUser?.name || ""} disabled />
          <TextField type="date" label="Data" value={apptDate} onChange={(e) => setApptDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField type="time" label="Hora" value={apptTime} onChange={(e) => setApptTime(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Observação" value={apptNote} onChange={(e) => setApptNote(e.target.value)} multiline minRows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeScheduleDialog}>Cancelar</Button>
          <Button variant="contained" onClick={saveAppointment}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={weekDialogOpen} onClose={closeWeekDialog} fullWidth maxWidth="sm">
        <DialogTitle>Consultas da Semana</DialogTitle>
        <DialogContent dividers>
          {weeklyAppointments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhuma consulta nesta semana.</Typography>
          ) : (
            weeklyAppointments.map(a => (
              <Box key={a.id} sx={{ mb: 2, p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.userName}</Typography>
                    <Typography variant="body2" color="text.secondary">{a.date} • {a.time}</Typography>
                    {a.note ? <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Obs: {a.note}</Typography> : null}
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => { setStartAppointment(a); setStartDialogOpen(true); }}
                    >
                      INICIAR CONSULTA
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWeekDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={startDialogOpen} onClose={closeStartConsultation}>
        <DialogTitle>Iniciar Consulta</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Escolha uma ação para esta consulta:
          </DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="outlined" onClick={openUpdateData}>
              Atualizar Dados
            </Button>
            <Button variant="contained" color="success" onClick={handlePlanDiet}>
              Planejar Dieta
            </Button>
            <Button 
              fullWidth
              variant="outlined" 
              color="secondary"
              onClick={() => {
                if (!startAppointment) return;
                const pacienteUser = users.find(u => u.id === startAppointment.userId) || {};
                navigate('/dashboard', { 
                  state: { 
                    user: pacienteUser,
                    pacienteId: startAppointment.userId,
                    patientName: startAppointment.userName || pacienteUser?.name || 'Paciente'
                  } 
                });
                closeStartConsultation();
              }}
            >
              Ver Dashboard
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStartConsultation}>Fechar</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={updateDialogOpen} onClose={closeUpdateData} maxWidth="md" fullWidth>
        <DialogTitle >Atualizar Dados do Paciente</DialogTitle>
        <DialogContent sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pb: 2 }}>
          <TextField sx={{mt:4}} label="Nome" value={updateForm.name} onChange={(e) => setUpdateForm(f => ({ ...f, name: e.target.value }))} fullWidth />
          <TextField sx={{mt:4}} label="IMC" value={computeImc(updateForm.peso, updateForm.altura)} disabled fullWidth />

          <TextField label="Peso (kg)" value={updateForm.peso} onChange={(e) => setUpdateForm(f => ({ ...f, peso: e.target.value }))} fullWidth />
          <TextField label="Altura (cm)" value={updateForm.altura} onChange={(e) => setUpdateForm(f => ({ ...f, altura: e.target.value }))} fullWidth />
          <TextField label="Idade Metabólica" value={updateForm.idadeMetabolica} onChange={(e) => setUpdateForm(f => ({ ...f, idadeMetabolica: e.target.value }))} fullWidth />
          <TextField label="Massa Muscular (kg)" value={updateForm.massaMuscular} onChange={(e) => setUpdateForm(f => ({ ...f, massaMuscular: e.target.value }))} fullWidth />
          <TextField label="Gordura (%)" value={updateForm.porcentagemGordura} onChange={(e) => setUpdateForm(f => ({ ...f, porcentagemGordura: e.target.value }))} fullWidth />
          <TextField label="Gordura Visceral (%)" value={updateForm.gorduraVisceral} onChange={(e) => setUpdateForm(f => ({ ...f, gorduraVisceral: e.target.value }))} fullWidth />

          <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Circunferências</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              {Object.keys(updateForm.circ).map((k) => (
                <TextField
                  key={k}
                  label={k}
                  value={updateForm.circ[k] || ""}
                  onChange={(e) => setUpdateForm(f => ({ ...f, circ: { ...f.circ, [k]: e.target.value } }))}
                  fullWidth
                />
              ))}
            </Box>
          </Box>

          <TextField label="Data da Consulta (obrigatória)" type="date" value={updateForm.date} onChange={(e) => setUpdateForm(f => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth sx={{ gridColumn: "1 / -1" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpdateData}>Cancelar</Button>
          <Button variant="contained" onClick={saveUpdateData}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
