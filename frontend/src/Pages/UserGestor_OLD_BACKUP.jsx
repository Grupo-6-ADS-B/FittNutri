import { useEffect, useState } from "react";
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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Paper,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const formatDateHuman = (dateString, timeString) => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} ${months[month - 1]} ${year} • ${timeString || '09:00'}`;
  } catch {
    return `${dateString} • ${timeString || '09:00'}`;
  }
};

const getConsultationStatus = (dateString) => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const consultDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    consultDate.setHours(0, 0, 0, 0);

    if (consultDate.getTime() === today.getTime()) {
      return { icon: '🟢', label: 'Hoje', color: '#4caf50', bgColor: '#e8f5e9' };
    } else if (consultDate > today) {
      return { icon: '🔵', label: 'Próxima', color: '#2196f3', bgColor: '#e3f2fd' };
    } else {
      return { icon: '🔴', label: 'Atrasada', color: '#f44336', bgColor: '#ffebee' };
    }
  } catch {
    return { icon: '⚪', label: 'Data inválida', color: '#9e9e9e', bgColor: '#f5f5f5' };
  }
};


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
  const [completedSteps, setCompletedSteps] = useState({ anthropo: false, diet: false, dashboard: false });

  const persistActivePatient = (patientId, patientName) => {
    if (!patientId) return;
    const idValue = String(patientId);
    sessionStorage.setItem('pacienteId', idValue);
    localStorage.setItem('pacienteId', idValue);
    if (patientName) {
      sessionStorage.setItem('pacienteNome', patientName);
      localStorage.setItem('pacienteNome', patientName);
    }
  };

  const resolveActivePatientId = () => {
    if (startAppointment?.userId) return startAppointment.userId;
    const stored = sessionStorage.getItem('pacienteId') || localStorage.getItem('pacienteId');
    return stored ? parseInt(stored, 10) : null;
  };
  
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

  const closeStartConsultation = () => {
    setStartDialogOpen(false);
    setStartAppointment(null);
  };

  const handleViewUserData = (user) => {
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
  };

  const openUpdateData = async () => {
    const patientId = resolveActivePatientId();
    if (!patientId) {
      alert("ID do paciente não encontrado. Selecione um paciente válido.");
      return;
    }
    
    const userFromList = users.find(u => u.id === patientId) || {};
    const appointmentName = startAppointment?.userName;
    const name = appointmentName || userFromList.name || "";
    
    setUpdateForm({
      id: patientId,
      name: name,
      peso: userFromList.peso ?? "",
      altura: userFromList.altura ?? "",
      idadeMetabolica: userFromList.idadeMetabolica ?? "",
      massaMuscular: userFromList.massaMuscular ?? "",
      porcentagemGordura: userFromList.porcentagemGordura ?? "",
      gorduraVisceral: userFromList.gorduraVisceral ?? "",
      circ: { ...initialCirc, ...(userFromList.circ || {}) },
      date: startAppointment?.date || ""
    });

    try {
      const res = await api.get(`/patient-history/${patientId}`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
          ? res.data.content
          : [];
      const latest = list.length ? list[list.length - 1] : null;
      if (latest) {
        const anthropo =
          latest.anthropometricDataModel ||
          latest.anthropometricData ||
          latest.dadosAntropometricos ||
          {};
        const circ =
          latest.dataCircleModel ||
          latest.dataCircle ||
          latest.dadosCircunferencia ||
          {};
        const dateValue = latest.dataConsulta || latest.data || latest.date;
        const circUpdates = {
          "Circunferência Abdominal (cm)": circ.abdominal,
          "Circunferência Cintura (cm)": circ.cintura,
          "Circunferência Quadril (cm)": circ.quadril,
          "Circunferência Pulso (cm)": circ.pulso,
          "Circunferência Panturrilha (cm)": circ.panturrilha,
          "Circunferência Braço (cm)": circ.braco,
          "Circunferência Coxa (cm)": circ.coxa,
          "Peso Ideal (kg)": circ.pesoIdeal
        };
        setUpdateForm(prev => {
          const mergedCirc = { ...prev.circ };
          Object.entries(circUpdates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) mergedCirc[key] = value;
          });
          return {
            ...prev,
            date: dateValue || prev.date,
            peso: anthropo.peso ?? prev.peso,
            altura: anthropo.altura ?? prev.altura,
            idadeMetabolica: anthropo.idadeMetabolica ?? prev.idadeMetabolica,
            massaMuscular: anthropo.massaMuscular ?? prev.massaMuscular,
            porcentagemGordura: anthropo.porcentagemGordura ?? prev.porcentagemGordura,
            gorduraVisceral: anthropo.gorduraVisceral ?? prev.gorduraVisceral,
            circ: mergedCirc
          };
        });
      }
    } catch (e) {
      console.error('Erro ao buscar historico do paciente:', e);
    }
    setUpdateDialogOpen(true);
  };

  const closeUpdateData = () => setUpdateDialogOpen(false);

  
  const saveUpdateData = async () => {
  if (!startAppointment) return;

  if (!updateForm.date) {
    alert("Data é obrigatória para gerar a dashboard.");
    return;
  }

  setCompletedSteps(prev => ({ ...prev, anthropo: true }));

  const pacienteId = updateForm.id || resolveActivePatientId();
  if (!pacienteId) {
    alert("ID do paciente não encontrado. Selecione um paciente válido.");
    return;
  }

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) {
    alert("Você precisa estar logado para salvar os dados.");
    return;
  }

  const dateParts = updateForm.date.split('-');
  const adjustDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  adjustDate.setDate(adjustDate.getDate() + 1);
  const year = adjustDate.getFullYear();
  const month = String(adjustDate.getMonth() + 1).padStart(2, '0');
  const day = String(adjustDate.getDate()).padStart(2, '0');
  const adjustedDate = `${year}-${month}-${day}T00:00:00Z`;

  const payload = {
    dataConsulta: adjustedDate,
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
    await api.post(`/patient-history/${pacienteId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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

};

  const handlePlanDiet = () => {
    if (!startAppointment) return;
    const user = users.find(u => u.id === startAppointment.userId);
    const patientName = startAppointment.userName || user?.name || 'Paciente';
    persistActivePatient(startAppointment.userId, patientName);
    setCompletedSteps(prev => ({ ...prev, diet: true }));
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

  useEffect(() => {
    const storedAppointment = sessionStorage.getItem('activeConsultation');
    const isDialogOpen = sessionStorage.getItem('consultationDialogOpen');
    const storedSteps = sessionStorage.getItem('consultationSteps');
    
    if (storedAppointment && isDialogOpen === 'true') {
      try {
        const parsed = JSON.parse(storedAppointment);
        setStartAppointment(parsed);
        setStartDialogOpen(true);
        
        if (storedSteps) {
          setCompletedSteps(JSON.parse(storedSteps));
        }
      } catch {
        sessionStorage.removeItem('activeConsultation');
        sessionStorage.removeItem('consultationDialogOpen');
        sessionStorage.removeItem('consultationSteps');
      }
    }
  }, []);

  useEffect(() => {
    if (startAppointment && startDialogOpen) {
      try {
        sessionStorage.setItem('activeConsultation', JSON.stringify(startAppointment));
        sessionStorage.setItem('consultationDialogOpen', 'true');
      } catch {}
    } else {
      sessionStorage.removeItem('activeConsultation');
      sessionStorage.setItem('consultationDialogOpen', 'false');
    }
  }, [startAppointment, startDialogOpen]);

  useEffect(() => {
    if (startDialogOpen && startAppointment) {
      try {
        sessionStorage.setItem('consultationSteps', JSON.stringify(completedSteps));
      } catch {}
    }
  }, [completedSteps, startDialogOpen, startAppointment]);

  const filteredUsers = users
    .filter((user) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        (user.telefone || user.phone)?.toLowerCase().includes(term) ||
        user.cidade?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const fieldA = a[filterType] || "";
      const fieldB = b[filterType] || "";
      const valueA = fieldA.toString().toLowerCase();
      const valueB = fieldB.toString().toLowerCase();
      return valueA.localeCompare(valueB);
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
          <Box
            sx={{
              width: "100%",
              maxWidth: 1400,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{mt: 5, fontWeight: 700, mb: 3, color: '#1b5e20' }}>
                Gerenciamento de Pacientes
              </Typography>

              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow: 2,
                }}
              >
                <TextField
                  placeholder="Buscar por nome, email ou telefone…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#2e7d32' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                  size="small"
                />

                <TextField
                  select
                  size="small"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ minWidth: 160 }}
                  label="Ordenar por"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SortIcon sx={{ color: '#2e7d32' }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="name"> Nome</MenuItem>
                  <MenuItem value="email"> Email</MenuItem>
                  <MenuItem value="telefone"> Telefone</MenuItem>
                  <MenuItem value="cidade"> Cidade</MenuItem>
                </TextField>

                <Button
                  onClick={openWeekDialog}
                  variant="contained"
                  startIcon={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CalendarTodayIcon sx={{ fontSize: 18 }} />
                    </Box>
                  }
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#2e7d32",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#256026" }
                  }}
                >
                  Consultas
                </Button>

                <Box sx={{ ml: 'auto' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddUser}
                    sx={{
                      backgroundColor: "#2e7d32",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#256026" }
                    }}
                  >
                    Adicionar Paciente
                  </Button>
                </Box>
              </Paper>
            </Box>

            {filteredUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Nenhum paciente encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adicione um novo paciente para começar
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredUsers.map((user) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={user?.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        backgroundColor: "white",
                        boxShadow: 2,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        border: "2px solid transparent",
                        position: "relative",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: 5,
                          borderColor: "#2e7d32",
                        },
                      }}
                    >
                     
                      <Box
                        sx={{
                          p: 3,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          borderBottom: "3px solid #2e7d32",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <Avatar
                          src={user.avatar}
                          sx={{
                            width: 80,
                            height: 80,
                            border: "3px solid #2e7d32",
                            fontSize: "2rem",
                            fontWeight: 700,
                            backgroundColor: "#2e7d32",
                          }}
                        >
                          {user.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#1b5e20", mb: 1 }}
                          >
                            {user.name}
                          </Typography>
                          <Chip
                            label={user.cidade}
                            size="small"
                            sx={{
                              backgroundColor: "#e8f5e9",
                              color: "#2e7d32",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 24,
                            }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ p: 3, flex: 1 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}
                            >
                               Email
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "#333",
                                mt: 0.5,
                                wordBreak: "break-word",
                                fontSize: "0.9rem",
                              }}
                            >
                              {user.email}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}
                            >
                               Telefone
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "#333",
                                mt: 0.5,
                                fontSize: "0.9rem",
                              }}
                            >
                              {user.telefone || user.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          p: 2.5,
                          borderTop: "1px solid #f0f0f0",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleViewUserData(user)}
                          sx={{
                            color: "#2e7d32",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            flex: 1,
                            "&:hover": {
                              backgroundColor: "#f1f8e9",
                            },
                          }}
                        >
                          Ver Dados
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => openScheduleDialog(user)}
                          sx={{
                            backgroundColor: "#2e7d32",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            flex: 1,
                            "&:hover": { backgroundColor: "#256026" },
                          }}
                        >
                          Agendar
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => requestDeleteUser(user)}
                          sx={{
                            color: "#d32f2f",
                            padding: "8px",
                            "&:hover": {
                              backgroundColor: "rgba(211, 47, 47, 0.08)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
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
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 320, }}>
          <TextField label="Paciente" value={scheduleUser?.name || ""} sx={{mt:4}} disabled />
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
        <DialogTitle sx={{ pb: 2 }}>📅 Próximas Consultas</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {weeklyAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhuma consulta agendada no período selecionado.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {weeklyAppointments.map(a => {
                const status = getConsultationStatus(a.date);
                const formattedDate = formatDateHuman(a.date, a.time);
                return (
                  <Paper
                    key={a.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                      backgroundColor: a.status === 'finalizada' ? '#f5f5f5' : '#fafafa',
                      transition: 'all 0.3s',
                      opacity: a.status === 'finalizada' ? 0.7 : 1,
                      '&:hover': a.status === 'finalizada' ? {} : {
                        boxShadow: 2,
                        backgroundColor: '#f5f5f5',
                        borderColor: '#2e7d32',
                      }
                    }}
                  >
            
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1b5e20' }}>
                          {a.userName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                          <Chip
                            icon={<Typography sx={{ fontSize: '1rem !important', mr: 0.5 }}>{status.icon}</Typography>}
                            label={a.status === 'finalizada' ? 'Finalizada' : status.label}
                            size="small"
                            sx={{
                              backgroundColor: a.status === 'finalizada' ? '#c8e6c9' : status.bgColor,
                              color: a.status === 'finalizada' ? '#2e7d32' : status.color,
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              height: 28
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {formattedDate}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Observações se existirem */}
                    {a.note && (
                      <Box sx={{ mb: 2, p: 1.5, borderLeft: '3px solid #2e7d32', backgroundColor: '#f9fdf8', borderRadius: '4px' }}>
                        <Typography variant="body2" sx={{ color: '#333', fontStyle: 'italic', fontSize: '0.95rem' }}>
                          "{a.note}"
                        </Typography>
                      </Box>
                    )}

                    {/* Botão Entrar na Consulta */}
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={a.status === 'finalizada'}
                      endIcon={a.status === 'finalizada' ? null : <PlayArrowIcon />}
                      onClick={() => {
                        const patientName = a.userName || users.find(u => u.id === a.userId)?.name || 'Paciente';
                        persistActivePatient(a.userId, patientName);
                        setStartAppointment(a);
                        setStartDialogOpen(true);
                        setSnackbar({ open: true, message: '🟢 Consulta iniciada!', severity: 'success' });
                      }}
                      sx={{
                        backgroundColor: a.status === 'finalizada' ? '#bdbdbd' : '#2e7d32',
                        color: a.status === 'finalizada' ? '#666' : 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.3,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: a.status === 'finalizada' ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': a.status === 'finalizada' ? {} : { backgroundColor: '#256026' }
                      }}
                    >
                      {a.status === 'finalizada' ? '✅ Consulta Finalizada' : 'Entrar na Consulta'}
                    </Button>
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeWeekDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={startDialogOpen} onClose={closeStartConsultation} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#2e7d32', color: 'white', py: 1.8, px: 3 }}>
          {startAppointment && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  Consulta em Andamento
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                {startAppointment.userName} • {formatDateHuman(startAppointment.date, startAppointment.time)}
              </Typography>
            </Box>
          )}
        </DialogTitle>

        <DialogContent sx={{ mt: 2, pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: '#f9fdf8',
                borderLeft: '4px solid #2e7d32',
                border: '1px solid #e8f5e9'
              }}
            >
              <Typography variant="subtitle2" sx={{fontSize: '1.rem', fontWeight: 700, color: '#1b5e20', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ fontSize: '1.1rem' }}>📋</Box> Passos da Consulta
              </Typography>
              
              {/* Progress Bar */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', fontSize: '0.85rem' }}>
                    Progresso
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32', fontSize: '0.9rem' }}>
                    {Object.values(completedSteps).filter(Boolean).length} de 3
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(Object.values(completedSteps).filter(Boolean).length / 3) * 100}%`,
                      backgroundColor: Object.values(completedSteps).filter(Boolean).length === 3 ? '#4caf50' : '#4caf50',
                      transition: 'all 0.4s ease',
                      borderRadius: '4px',
                      boxShadow: Object.values(completedSteps).filter(Boolean).length === 3 ? '0 0 12px rgba(76, 175, 80, 0.6)' : 'none'
                    }}
                  />
                </Box>
                {Object.values(completedSteps).filter(Boolean).length === 3 && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#4caf50', fontWeight: 700, fontSize: '0.8rem', animation: 'pulse 2s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } } }}>
                    ✅ Consulta pronta para finalizar
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {[
                  { key: 'anthropo', icon: '📊', label: 'Atualizar dados antropométricos' },
                  { key: 'diet', icon: '📋', label: 'Planejar ou ajustar dieta' },
                  { key: 'dashboard', icon: '📈', label: 'Consultar dashboard e tendências' }
                ].map((step) => (
                  <Box
                    key={step.key}
                    onClick={() => setCompletedSteps(prev => ({ ...prev, [step.key]: !prev[step.key] }))}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.2,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: completedSteps[step.key] ? '#e8f5e9' : 'transparent',
                      border: completedSteps[step.key] ? '1px solid #4caf50' : '1px solid transparent',
                      '&:hover': {
                        backgroundColor: '#f1f1f1'
                      }
                    }}
                  >
                    <Box sx={{ fontSize: '1.3rem' }}>
                      {completedSteps[step.key] ? '☑️' : '⬜'}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: completedSteps[step.key] ? 600 : 500,
                        color: completedSteps[step.key] ? '#2e7d32' : '#333',
                        textDecoration: completedSteps[step.key] ? 'line-through' : 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={openUpdateData}
              sx={{
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#2e7d32',
                color: 'white',
                borderRadius: '8px',
                transition: 'all 0.2s',
                border: 'none',
                '&:hover': { 
                  backgroundColor: '#256026',
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              {completedSteps.anthropo ? '✅ Dados Atualizados' : '📊 Atualizar Dados'}
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={handlePlanDiet}
              sx={{
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#2e7d32',
                color: 'white',
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': { 
                  backgroundColor: '#256026',
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
            >
              {completedSteps.diet ? '✅ Dieta Planejada' : '📋 Planejar Dieta'}
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                if (!startAppointment) return;
                const pacienteUser = users.find(u => u.id === startAppointment.userId) || {};
                const patientName = startAppointment.userName || pacienteUser?.name || 'Paciente';
                persistActivePatient(startAppointment.userId, patientName);
                setCompletedSteps(prev => ({ ...prev, dashboard: true }));
                navigate('/dashboard', {
                  state: {
                    user: pacienteUser,
                    pacienteId: startAppointment.userId,
                    patientName
                  }
                });
              }}
              sx={{
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#2e7d32',
                color: 'white',
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': { 
                  backgroundColor: '#256026',
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
            >
              {completedSteps.dashboard ? '✅ Dashboard Visualizado' : '📈 Ver Dashboard'}
            </Button>

            {/* Botão Finalizar Consulta - aparece quando todos os 3 passos estão concluídos */}
            {Object.values(completedSteps).filter(Boolean).length === 3 && (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setSnackbar({ 
                    open: true, 
                    message: '✅ Consulta finalizada com sucesso! Paciente aguardando proximas orientações.', 
                    severity: 'success' 
                  });
                  // Marcar consulta como finalizada
                  setAppointments(prev => prev.map(a => 
                    a.id === startAppointment.id ? { ...a, status: 'finalizada' } : a
                  ));
                  try {
                    const updated = appointments.map(a => 
                      a.id === startAppointment.id ? { ...a, status: 'finalizada' } : a
                    );
                    localStorage.setItem("appointments", JSON.stringify(updated));
                  } catch {}
                  // Limpar estado da consulta
                  setStartDialogOpen(false);
                  setStartAppointment(null);
                  setCompletedSteps({ anthropo: false, diet: false, dashboard: false });
                  sessionStorage.removeItem('activeConsultation');
                  sessionStorage.removeItem('consultationDialogOpen');
                  sessionStorage.removeItem('consultationSteps');
                }}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  backgroundColor: '#4caf50',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  boxShadow: 2,
                  '&:hover': { 
                    backgroundColor: '#388e3c',
                    transform: 'scale(1.02)',
                    boxShadow: 4
                  },
                }}
              >
                ✅ Finalizar Consulta
              </Button>
            )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'flex-start', borderTop: '1px solid #f0f0f0' }}>
          <Button 
            onClick={closeStartConsultation} 
            sx={{
              color: '#888',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                color: '#2e7d32',
                backgroundColor: 'transparent'
              }
            }}
          >
            ← Voltar
          </Button>
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
