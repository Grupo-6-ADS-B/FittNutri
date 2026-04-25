import { useEffect, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import api from '../utils/api';
import { useNavigate, useLocation } from "react-router-dom";
import {
  CssBaseline,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Pagination,
} from "@mui/material";
import SearchHeader from '../components/UserGestor/SearchHeader';
import PatientCard from '../components/UserGestor/PatientCard';
import ConfirmDialog from '../components/UserGestor/ConfirmDialog';
import ScheduleDialog from '../components/UserGestor/ScheduleDialog';
import WeeklyConsultationsDialog from '../components/UserGestor/WeeklyConsultationsDialog';
import ConsultationDialog from '../components/UserGestor/ConsultationDialog';
import UpdateDataDialog from '../components/UserGestor/UpdateDataDialog';
import {
  defaultUsers,
  computeImc,
  initialCirc,
} from '../utils/userGestorUtils';

export default function UserGestor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsTotalPages, setAppointmentsTotalPages] = useState(1);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleUser, setScheduleUser] = useState(null);
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("09:00");
  const [apptNote, setApptNote] = useState("");
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  const getEndDateString = () => {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return end.toISOString().split('T')[0];
  };
  const isPastAppointmentDate = (dateValue) => {
    if (!dateValue) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${dateValue}T00:00:00`);
    return selectedDate < today;
  };
  const [filterStartDate, setFilterStartDate] = useState(getTodayString());
  const [filterEndDate, setFilterEndDate] = useState(getEndDateString());
  
  const location = useLocation();
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

  const [updateForm, setUpdateForm] = useState({
    id: null,
    name: "",
    idade: "",
    motivoConsulta: "",
    peso: "",
    altura: "",
    idadeMetabolica: "",
    massaMuscular: "",
    porcentagemGordura: "",
    gorduraVisceral: "",
    taxaMetabolicaBasal: "",
    atividade: "",
    circ: { ...initialCirc },
    date: ""
  });

  const navigate = useNavigate();

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

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        let localAppointments = [];
        try {
          const stored = localStorage.getItem("appointments");
          if (stored) localAppointments = JSON.parse(stored);
        } catch {}

        const resolvedUserId = Number(userId);
        const pageSize = 10;
        const backendPage = Math.max(appointmentsPage - 1, 0);
        let list = [];
        let totalPages = 1;

        if (Number.isFinite(resolvedUserId) && resolvedUserId > 0) {
          const res = await api.get(`/schedulings/nutritionist/${resolvedUserId}`, {
            params: {
              page: backendPage,
              size: pageSize,
            },
          });

          list = Array.isArray(res.data?.content) ? res.data.content : [];
          totalPages = Number(res.data?.totalPages) || 1;
        } else {
          const res = await api.get('/schedulings');
          const allList = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
          totalPages = Math.max(Math.ceil(allList.length / pageSize), 1);
          const startIndex = backendPage * pageSize;
          list = allList.slice(startIndex, startIndex + pageSize);
        }

        const mapped = list.map((a) => {
          const localAppt = localAppointments.find(la => la.id === a.id);
          
          return {
            id: a.id,
            userId: a.pacienteId ?? a.usuarioId ?? null,
            userName: a.pacienteNome ?? "",
            nutricionistaName: a.nutricionistaNome ?? "",
            date: a.dataAgendada ?? "",
            time: "09:00",
            note: a.observacoes ?? "",
            status: localAppt?.status || undefined
          };
        });
        setAppointments(mapped);
        setAppointmentsTotalPages(Math.max(totalPages, 1));
        try { localStorage.setItem("appointments", JSON.stringify(mapped)); } catch {}
      } catch (e) {
        console.error("Erro ao carregar agendamentos:", e);
        try {
          const stored = localStorage.getItem("appointments");
          if (stored) setAppointments(JSON.parse(stored));
        } catch {}
        setAppointmentsTotalPages(1);
      }
    };
    loadAppointments();
  }, [userId, appointmentsPage]);

  const handleAppointmentsPageChange = (_, newPage) => {
    if (newPage === appointmentsPage) return;
    setAppointmentsPage(newPage);
  };

  const fetchUsers = async (pageUi = 1) => {
    setLoading(true);
    try {
      const backendPage = Math.max(pageUi - 1, 0);
      const response = await api.get('/patients', { params: { page: backendPage } });
      const list = Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
      const total = Number(response.data?.totalPages) || 1;
      const mapped = list.map(u => ({
            id: u.id ?? u.ID ?? u.idUsuario ?? u.codigo ?? undefined,
            name: u.name ?? u.nome ?? '',
            email: u.email ?? '',
            telefone: u.telefone ?? u.phone ?? '',
            cidade: u.cidade ?? u.city ?? '',
            motivoConsulta: u.motivoConsulta ?? '',
            avatar: u.avatar ?? '',
            cpf: u.cpf ?? '',
            crn: u.crn ?? '',
          }));
      setUsers(mapped);
      setTotalPages(Math.max(total, 1));
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
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUsers(currentPage);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentPage]);

  const handlePageChange = (_, newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
  };

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
      idade: userFromList.idade ?? "",
      motivoConsulta: userFromList.motivoConsulta ?? startAppointment?.note ?? "",
      peso: userFromList.peso ?? "",
      altura: userFromList.altura ?? "",
      idadeMetabolica: userFromList.idadeMetabolica ?? "",
      massaMuscular: userFromList.massaMuscular ?? "",
      porcentagemGordura: userFromList.porcentagemGordura ?? "",
      gorduraVisceral: userFromList.gorduraVisceral ?? "",
      taxaMetabolicaBasal: userFromList.taxaMetabolicaBasal ?? "",
      atividade: userFromList.atividade ?? "",
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
            idade: anthropo.idade ?? prev.idade,
            motivoConsulta: latest.motivoConsulta ?? latest.motivo_consulta ?? prev.motivoConsulta,
            peso: anthropo.peso ?? prev.peso,
            altura: anthropo.altura ?? prev.altura,
            idadeMetabolica: anthropo.idadeMetabolica ?? prev.idadeMetabolica,
            massaMuscular: anthropo.massaMuscular ?? prev.massaMuscular,
            porcentagemGordura: anthropo.porcentagemGordura ?? prev.porcentagemGordura,
            gorduraVisceral: anthropo.gorduraVisceral ?? prev.gorduraVisceral,
            taxaMetabolicaBasal: anthropo.taxaMetabolicaBasal ?? prev.taxaMetabolicaBasal,
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
      motivoConsulta: (updateForm.motivoConsulta || '').trim(),
      antropometria: {
        peso: Number(updateForm.peso),
        altura: Number(updateForm.altura),
        idade: updateForm.idade ? Number(updateForm.idade) : null,
        imc: Number(computeImc(updateForm.peso, updateForm.altura)),
        idadeMetabolica: Number(updateForm.idadeMetabolica),
        massaMuscular: Number(updateForm.massaMuscular),
        gorduraVisceral: Number(updateForm.gorduraVisceral),
        porcentagemGordura: Number(updateForm.porcentagemGordura),
        taxaMetabolicaBasal: Number(updateForm.taxaMetabolicaBasal),
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
      idade: updateForm.idade,
      motivoConsulta: updateForm.motivoConsulta,
      peso: updateForm.peso,
      altura: updateForm.altura,
      idadeMetabolica: updateForm.idadeMetabolica,
      massaMuscular: updateForm.massaMuscular,
      porcentagemGordura: updateForm.porcentagemGordura,
      gorduraVisceral: updateForm.gorduraVisceral,
      atividade: updateForm.atividade,
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

  const handleViewDashboard = () => {
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
  };

  const handleFinalizeConsultation = () => {
    setSnackbar({ 
      open: true, 
      message: '✅ Consulta finalizada com sucesso! Paciente aguardando proximas orientações.', 
      severity: 'success' 
    });
    
    setAppointments(prev => {
      const updated = prev.map(a => 
        a.id === startAppointment.id ? { ...a, status: 'finalizada' } : a
      );
      
      try {
        localStorage.setItem("appointments", JSON.stringify(updated));
      } catch {}
      
      return updated;
    });
    
    setStartDialogOpen(false);
    setStartAppointment(null);
    setCompletedSteps({ anthropo: false, diet: false, dashboard: false });
    sessionStorage.removeItem('activeConsultation');
    sessionStorage.removeItem('consultationDialogOpen');
    sessionStorage.removeItem('consultationSteps');
  };

  const openWeekDialog = () => setWeekDialogOpen(true);
  const closeWeekDialog = () => setWeekDialogOpen(false);

  const weeklyAppointments = (() => {
    const start = new Date(filterStartDate + 'T00:00:00');
    const end = new Date(filterEndDate + 'T23:59:59');
    return appointments.filter(a => {
      const d = new Date(a.date + 'T00:00:00');
      return d >= start && d <= end;
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

    if (isPastAppointmentDate(apptDate)) {
      setSnackbar({ open: true, message: 'Não é permitido agendar consulta em data passada.', severity: 'error' });
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

  const handleStartConsultation = (appointment) => {
    setStartAppointment(appointment);
    setStartDialogOpen(true);
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
        <Box sx={{ 
          bgcolor: snackbar.severity === 'success' ? '#43a047' : '#d32f2f', 
          color: 'white', 
          px: 3, 
          py: 1.5, 
          borderRadius: 2, 
          boxShadow: 3, 
          fontWeight: 500, 
          fontSize: '1rem' 
        }}>
          {snackbar.message}
        </Box>
      </Snackbar>

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
              <Typography variant="h4" sx={{ mt: 5, fontWeight: 700, mb: 3, color: '#1b5e20' }}>
                Gerenciamento de Pacientes
              </Typography>

              <SearchHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterChange={setFilterType}
                onWeekDialogOpen={openWeekDialog}
                onAddPatient={handleAddUser}
              />
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress color="success" />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Nenhum paciente encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adicione um novo paciente para começar
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {filteredUsers.map((user) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={user?.id}>
                      <PatientCard
                        user={user}
                        onViewData={handleViewUserData}
                        onSchedule={openScheduleDialog}
                        onDelete={requestDeleteUser}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Box
                  sx={{
                    mt: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Página {currentPage} de {totalPages}
                  </Typography>
                  <Pagination
                    color="success"
                    page={currentPage}
                    count={totalPages}
                    onChange={handlePageChange}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeleteUser}
        userName={userToDelete?.name}
      />

      <ScheduleDialog
        open={scheduleOpen}
        onClose={closeScheduleDialog}
        onSave={saveAppointment}
        scheduleUser={scheduleUser}
        apptDate={apptDate}
        setApptDate={setApptDate}
        apptTime={apptTime}
        setApptTime={setApptTime}
        apptNote={apptNote}
        setApptNote={setApptNote}
      />

      <WeeklyConsultationsDialog
        open={weekDialogOpen}
        onClose={closeWeekDialog}
        weeklyAppointments={weeklyAppointments}
        appointmentsPage={appointmentsPage}
        appointmentsTotalPages={appointmentsTotalPages}
        onAppointmentsPageChange={handleAppointmentsPageChange}
        users={users}
        onStartConsultation={handleStartConsultation}
        persistActivePatient={persistActivePatient}
        setSnackbar={setSnackbar}
        startDate={filterStartDate}
        endDate={filterEndDate}
        onStartDateChange={setFilterStartDate}
        onEndDateChange={setFilterEndDate}
      />

      <ConsultationDialog
        open={startDialogOpen}
        onClose={closeStartConsultation}
        startAppointment={startAppointment}
        completedSteps={completedSteps}
        setCompletedSteps={setCompletedSteps}
        onUpdateData={openUpdateData}
        onPlanDiet={handlePlanDiet}
        onViewDashboard={handleViewDashboard}
        onFinalize={handleFinalizeConsultation}
      />

      <UpdateDataDialog
        open={updateDialogOpen}
        onClose={closeUpdateData}
        onSave={saveUpdateData}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        selectedUser={users.find(u => u.id === (updateForm.id || resolveActivePatientId()))}
      />
    </>
  );
}
