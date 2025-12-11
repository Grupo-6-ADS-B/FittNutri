import React, { useMemo, useEffect } from "react";
import api from '../utils/api';
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box, Typography, Paper, Card, CardMedia, CardContent,
    IconButton, Tooltip, Button, FormControl, InputLabel,
    Select, MenuItem, Collapse, Drawer, Avatar, Grid
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import EditIcon from '@mui/icons-material/Edit';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuIcon from '@mui/icons-material/Menu';
import ScaleIcon from '@mui/icons-material/Scale';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const minimalWidth = 80;
const expandedWidth = 340;

const KpiImageUrls = {
    pesoAtual: 'https://images.unsplash.com/photo-1542849800-47864f77894a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    pesoMeta: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab93b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    imc: 'https://images.unsplash.com/photo-1533538415848-0c6c19f668f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    tmb: 'https://images.unsplash.com/photo-1542838337-ab72f883215f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
};

const KpiAnimatedCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(1.2),
    overflow: 'hidden',
    position: 'relative',
    height: 120,
    width: '100%',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1.2),
    border: 'none',
    background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)',
}));

const KpiCarouselCard = ({ title, value, unit, description, icon: Icon, imageId, valueColor }) => {
    const imageUrl = KpiImageUrls[imageId];
    return (
        <KpiAnimatedCard imageurl={imageUrl}>
            <Box className="kpi-media" />
            <CardContent sx={{ position: 'relative', zIndex: 3, p: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Icon sx={{ color: valueColor, fontSize: 28, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">{title}</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: valueColor, mb: 0.5 }}>
                    {value} {unit}
                </Typography>
                <Typography variant="body2" color="text.secondary">{description}</Typography>
            </CardContent>
        </KpiAnimatedCard>
    );
};



export default function ResumoCircunferencia() {
        const [consultas, setConsultas] = React.useState([]);
        const [selectedConsulta, setSelectedConsulta] = React.useState(null);
        const [evolucaoData, setEvolucaoData] = React.useState(null);

        React.useEffect(() => {
            async function fetchConsultas() {
                try {
                    const stored = localStorage.getItem("appointments");
                    let list = [];
                    if (stored) list = JSON.parse(stored);
                    if (!list.length) {
                        const res = await api.get('/schedulings');
                        list = Array.isArray(res.data) ? res.data : [];
                    }
                    setConsultas(list);
                    if (list.length) setSelectedConsulta(list[0]);
                } catch {
                    setConsultas([]);
                }
            }
            fetchConsultas();
        }, []);

        React.useEffect(() => {
            async function fetchEvolucao() {
                if (!selectedConsulta?.userId || !selectedConsulta?.date) return;
                try {
                    const res = await api.get(`/anthropometric-data/paciente/${selectedConsulta.userId}?date=${selectedConsulta.date}`);
                    setEvolucaoData(res.data);
                    // backend retorna altura em metros; manter como está para evolução (service pode usar metros)
                } catch {
                    setEvolucaoData(null);
                }
            }
            fetchEvolucao();
        }, [selectedConsulta]);
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const success = theme.palette.success.main;
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isCardOpen, setIsCardOpen] = React.useState(false); 
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    
    // Removido array mocado, agora os dados vêm do backend
    
    const [usersList, setUsersList] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [loadingUsers, setLoadingUsers] = React.useState(true);
    React.useEffect(() => {
        if (location.state?.user) setSelectedUser(location.state.user);
    }, [location.state?.user]);
    useEffect(() => {
        async function fetchUsers() {
            setLoadingUsers(true);
            try {
                const response = await api.get('/users');
                setUsersList(Array.isArray(response.data) ? response.data : []);
                // Prioriza usuário vindo do location.state
                if (location.state?.user) {
                    setSelectedUser(location.state.user);
                } else {
                    setSelectedUser(response.data?.[0] || null);
                }
            } catch {
                setUsersList([]);
                setSelectedUser(location.state?.user || null);
            }
            setLoadingUsers(false);
        }
        fetchUsers();
    }, [location.state?.user]);

    const [antropo, setAntropo] = React.useState({});
    const [dadosCirc, setDadosCirc] = React.useState({});
    const [noAntropoFound, setNoAntropoFound] = React.useState(false);
    const [noCircFound, setNoCircFound] = React.useState(false);
    useEffect(() => {
        async function fetchData() {
            if (!selectedUser?.id) return;
            try {
                const stored = localStorage.getItem(`questionario_${selectedUser.id}`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed?.antropoData) {
                        const a = parsed.antropoData;
                        // normaliza altura: se estiver em metros (<=10) converte para cm, se já estiver em cm mantém
                        let alturaVal = a.altura;
                        if (alturaVal !== undefined && alturaVal !== null && alturaVal !== '') {
                            const num = Number(String(alturaVal).replace(',', '.'));
                            if (!Number.isNaN(num)) {
                                alturaVal = num <= 10 ? num * 100 : num;
                            }
                        } else {
                            alturaVal = '';
                        }
                        setAntropo({ ...a, altura: alturaVal });
                    }
                    if (parsed?.circData) {
                        const c = parsed.circData;
                        const converted = {};
                        ["abdominal","cintura","quadril","pulso","panturrilha","braco","coxa","pesoIdeal"].forEach(k => {
                            if (c[k] !== undefined && c[k] !== null) converted[k] = String(c[k]);
                            else converted[k] = "";
                        });
                        setDadosCirc(converted);
                    }
                    return;
                }
            } catch (e) {
                console.error('Falha ao ler questionario local:', e);
            }
            try {
                const antropoRes = await api.get(`/anthropometric-data/paciente/${selectedUser.id}`);
                const lista = Array.isArray(antropoRes.data) ? antropoRes.data : [];
                const server = lista[0] || null;
                if (server) {
                    // converter altura de metros (backend) para cm (frontend espera cm)
                    const alturaServer = server.altura !== undefined && server.altura !== null ? Number(server.altura) : null;
                    // servidor guarda altura em metros (ex: 1.70). Se o valor retornado for <= 10 assume-se metros, converte para cm.
                    const alturaCm = (alturaServer !== null && !Number.isNaN(alturaServer)) ? (alturaServer <= 10 ? alturaServer * 100 : alturaServer) : '';
                    setAntropo({ ...server, altura: alturaCm });
                    setNoAntropoFound(false);
                } else {
                    setAntropo({});
                    setNoAntropoFound(true);
                }
            } catch (err) {
                setAntropo({});
                setNoAntropoFound(true);
                console.error('Erro ao buscar dados antropométricos:', err);
            }
            try {
                const circRes = await api.get(`/data-circle/patient/${selectedUser.id}`);
                const lista = Array.isArray(circRes.data) ? circRes.data : [];
                const serverCirc = lista[0] || null;
                if (serverCirc) {
                    // converte valores para string para exibição consistente
                    const converted = {};
                    ["abdominal","cintura","quadril","pulso","panturrilha","braco","coxa","pesoIdeal"].forEach(k => {
                        if (serverCirc[k] !== undefined && serverCirc[k] !== null) converted[k] = String(serverCirc[k]);
                        else converted[k] = "";
                    });
                    setDadosCirc(converted);
                    setNoCircFound(false);
                } else {
                    setDadosCirc({});
                    setNoCircFound(true);
                }
            } catch (err) {
                setDadosCirc({});
                setNoCircFound(true);
                console.error('Erro ao buscar dados de circunferência:', err);
            }
        }
        fetchData();
    }, [selectedUser?.id]);

    const handleChangeUser = (e) => {
        const uid = e.target.value;
        const found = (usersList || []).find(u => String(u.id) === String(uid));
        if (found) {
            setSelectedUser(found);
            setIsCardOpen(false);
        }
    };
    const calcularIMC = (peso, alturaM) => {
        if (!peso || !alturaM) return null;
        const v = peso / (alturaM * alturaM);
        return Number.isFinite(v) ? v : null;
    };
    const classificarIMC = (imc) => {
        if (imc == null) return "-";
        if (imc < 18.5) return "Abaixo do peso";
        if (imc < 24.9) return "Peso normal";
        if (imc < 29.9) return "Sobrepeso";
        if (imc < 34.9) return "Obesidade grau I";
        if (imc < 39.9) return "Obesidade grau II";
        return "Obesidade grau III";
    };
    const calcularTMB = (peso, alturaCm, idade, sexoFonte, atividadeFonte) => {
        if (!peso || !alturaCm || !idade) return null;
        let tmbBase;
        if ((sexoFonte || "").toLowerCase() === "masculino") {
            tmbBase = (10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5;
        } else {
            tmbBase = (10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161;
        }
        const fator = {
            "sedentário": 1.2,
            "levemente ativo": 1.375,
            "moderadamente ativo": 1.55,
            "muito ativo": 1.725,
            "extremamente ativo": 1.9,
        }[atividadeFonte] || 1.2;
        return Math.round(tmbBase * fator);
    };

    const imcValue = useMemo(() => {
        // Prioriza o IMC retornado pelo servidor quando disponível
        if (antropo && (antropo.imc !== undefined && antropo.imc !== null)) {
            const n = Number(antropo.imc);
            return Number.isFinite(n) ? n.toFixed(2) : null;
        }
        const peso = parseFloat(String(antropo.peso || '').replace(',', '.'));
        const alturaCm = parseFloat(String(antropo.altura || '').replace(',', '.'));
        if (!peso || !alturaCm) return null;
        const alturaM = alturaCm / 100;
        const v = calcularIMC(peso, alturaM);
        return v != null ? v.toFixed(2) : null;
    }, [antropo]);

    const imcClass = useMemo(() => {
        if (!imcValue) return "-";
        return classificarIMC(parseFloat(imcValue));
    }, [imcValue]);

    const tmbValue = useMemo(() => {
        // Prioriza valor retornado pelo servidor (taxaMetabolicaBasal)
        if (antropo && (antropo.taxaMetabolicaBasal !== undefined && antropo.taxaMetabolicaBasal !== null)) {
            const n = Number(antropo.taxaMetabolicaBasal);
            return Number.isFinite(n) ? Math.round(n) : null;
        }
        const peso = parseFloat(String(antropo.peso || '').replace(',', '.'));
        const alturaCm = parseFloat(String(antropo.altura || '').replace(',', '.'));
        const idade = parseFloat(String(antropo.idade || '').replace(',', '.'));
        const sexoFonte = selectedUser?.sexo ?? 'feminino';
        const atividadeFonte = (selectedUser?.atividade ?? 'sedentario');
        if (!peso || !alturaCm || !idade) return null;
        return calcularTMB(peso, alturaCm, idade, sexoFonte, atividadeFonte);
    }, [antropo, selectedUser?.sexo, selectedUser?.atividade]);

    const pesoAtual = useMemo(() => {
        const p = parseFloat(String(antropo.peso || '').replace(',', '.'));
        return Number.isFinite(p) && p > 0 ? parseFloat(p.toFixed(1)) : null;
    }, [antropo.peso]);

    const pesoMeta = useMemo(() => {
        // Sempre prioriza o valor salvo no backend (dadosCirc.pesoIdeal)
        let metaValor = dadosCirc?.pesoIdeal;
        if (metaValor === undefined || metaValor === null || metaValor === '') return '-';
        // Se vier string, tenta converter
        if (typeof metaValor === 'string') {
            metaValor = metaValor.replace(',', '.').replace(/[^\d.\-]/g, '');
        }
        const metaNum = Number(metaValor);
        if (Number.isFinite(metaNum)) return metaNum;
        return '-';
    }, [dadosCirc?.pesoIdeal]);

    const servicos = [
        { titulo: "Consulta Nutricional", descricao: "Avaliação completa e plano nutricional personalizado.", imagem: "/ligando.png" },
        { titulo: "Gráfico de evolução", descricao: "Gráficos detalhados para acompanhar seu progresso.", imagem: "/falando.png" },
        { titulo: "Educação Alimentar", descricao: "Orientação e criação de dietas nutritivas e personalizaveis.", imagem: "/dietas.png" },
    ];

  
  const massaMuscular =
    dadosCirc['Massa Muscular (kg)'] ||
    dadosCirc['massaMuscular'] ||
    dadosCirc['massa_muscular'] ||
    antropo['Massa Muscular (kg)'] ||
    antropo['massaMuscular'] ||
    antropo['massa_muscular'] ||
    '-';

  const gorduraVisceral =
    antropo['Gordura Visceral (%)'] ||
    antropo['gorduraVisceral'] ||
    antropo['gordura_visceral'] ||
    dadosCirc['Gordura Visceral (%)'] ||
    dadosCirc['gorduraVisceral'] ||
    dadosCirc['gordura_visceral'] ||
    '-';

  

    const UserSidebarContent = (
        <Paper elevation={3} sx={{ width: expandedWidth, p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120 }}>
            <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{ mt: 2, fontWeight: 'bold', fontSize: 18, px: 3 }}
                onClick={() => navigate('/gestor')}
            >
                Voltar para gerenciamento de pacientes
            </Button>
        </Paper>
    );

const minimalAvatarSize = 40;

function MinimalSidebar() {
    return (
        <Box
            sx={{
                width: minimalWidth,
                minWidth: minimalWidth,
                bgcolor: 'grey.100',
                borderRight: '1px solid #e0e0e0',
                p: 2,
                position: 'sticky',
                top: 0,
                height: '15vh',
                flexShrink: 0,
                zIndex: 1000,
                borderRadius: 2,
                overflowX: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Tooltip title="Expandir Menu" placement="right">
                <IconButton color="primary">
                    <MenuIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

function UserDetailDrawer() {
    return null;
}

function KpiLayout() {
    return (
        <Box sx={{ display: 'grid', gap: 1.2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
            <KpiCarouselCard
                title="Peso Atual"
                value={pesoAtual ?? '-'}
                unit="kg"
                description="Seu peso atual"
                icon={ScaleIcon}
                imageId="pesoAtual"
                valueColor={primary}
            />
            <KpiCarouselCard
                title="Peso Meta"
                value={pesoMeta ?? '-'}
                unit="kg"
                description="Meta de peso ideal"
                icon={TrendingUpIcon}
                imageId="pesoMeta"
                valueColor={success}
            />
            <KpiCarouselCard
                title="IMC"
                value={imcValue ?? '-'}
                unit=""
                description={imcClass}
                icon={FitnessCenterIcon}
                imageId="imc"
                valueColor={primary}
            />
            <KpiCarouselCard
                title="TMB"
                value={tmbValue ?? '-'}
                unit="kcal"
                description="Taxa Metabólica Basal"
                icon={LocalFireDepartmentIcon}
                imageId="tmb"
                valueColor={success}
            />
        </Box>
    );
}

if (!selectedUser && !loadingUsers) {
    return (
        <Box sx={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)' }}>
            <Paper elevation={4} sx={{ p: 4, bgcolor: 'white' }}>
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Nenhum usuário selecionado ou encontrado.<br />
                    Volte e preencha o questionário novamente.
                </Typography>
                <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/questionario')}>
                    Voltar para o questionário
                </Button>
            </Paper>
        </Box>
    );
}

    return (
        <Box sx={{ minHeight: "90vh", background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)', width: '100%' }}>
            <Box sx={{ p: { xs: 2, md: 4 }, overflowY: 'auto' }}>
                <Paper elevation={4} sx={{ p: 4, bgcolor: 'white' }}>
                    {loadingUsers ? (
                        <Typography variant="h6" color="primary" sx={{ textAlign: 'center', mt: 6 }}>
                            Carregando usuários...
                        </Typography>
                    ) : usersList.length === 0 ? (
                        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>
                            Nenhum usuário encontrado. Cadastre um usuário para visualizar os dados.
                        </Typography>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>Resumo dos Dados de Circunferência</Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    sx={{ ml: 2, fontWeight: 'bold', fontSize: 18, px: 3, height: 56, textTransform: 'none' }}
                                    aria-label="Selecionar data de consulta"
                                    endIcon={<MenuOpenIcon />}
                                    onClick={() => setIsCardOpen(true)}
                                    id="select-consulta-btn"
                                >
                                    {selectedConsulta?.date ? new Date(selectedConsulta.date).toLocaleDateString() : 'Selecionar data de consulta'}
                                </Button>
                                <Dialog open={isCardOpen} onClose={() => setIsCardOpen(false)} aria-labelledby="select-consulta-dialog" maxWidth="xs" fullWidth anchorEl={document.getElementById('select-consulta-btn')}>
                                    <DialogTitle id="select-consulta-dialog" sx={{ fontWeight: 'bold', fontSize: 18 }}>Selecione a data da consulta</DialogTitle>
                                    <DialogContent>
                                        {consultas.map(c => (
                                            <Button
                                                key={c.id}
                                                variant={selectedConsulta?.id === c.id ? 'contained' : 'outlined'}
                                                color="primary"
                                                sx={{ mb: 1, width: '100%', textTransform: 'none', fontSize: 16 }}
                                                onClick={() => { setSelectedConsulta(c); setIsCardOpen(false); }}
                                            >
                                                {c.date ? new Date(c.date).toLocaleDateString() : 'Sem data'}
                                            </Button>
                                        ))}
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setIsCardOpen(false)} sx={{ width: '100%' }}>Fechar</Button>
                                    </DialogActions>
                                </Dialog>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="medium"
                                    sx={{ ml: 2, fontWeight: 'bold', fontSize: 16, px: 2 }}
                                    onClick={() => navigate('/gestor')}
                                >
                                    Voltar para gerenciamento de pacientes
                                </Button>
                            </Box>
                            {/* Removido JSON bruto de evolução. Exiba apenas dados relevantes, se necessário. */}
                            <Typography variant="body1" sx={{ mb: 4 }}>
                                Aqui está um resumo dos dados mais importantes para sua avaliação nutricional.
                            </Typography>
                        <Grid container spacing={4} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={7}>
                                <Typography variant="h6" gutterBottom>Indicadores Antropométricos</Typography>
                                <KpiLayout />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Paper elevation={0} sx={{ p: 3, height: '100%', borderLeft: theme => `3px solid ${theme.palette.primary.dark}`, bgcolor: '#f5f5f5' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                        Bem-vindo à sua experiência FIttNutri
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
                                        <span style={{ color: '#185a2e', fontWeight: 700 }}>FittNutri</span> utiliza seus <span style={{ color: '#185a2e', fontWeight: 700 }}>dados</span> para proporcionar uma <span style={{ color: '#ff9800', fontWeight: 700 }}>consulta mais precisa</span> e personalizada. Nossa equipe está dedicada a oferecer <span style={{ color: '#185a2e', fontWeight: 700 }}>monitoramento</span> contínuo e <span style={{ color: '#ff9800', fontWeight: 700 }}>auxílio</span> para atender às suas <span style={{ color: '#185a2e', fontWeight: 700 }}>necessidades nutricionais</span>.
                                        <br /><br />
                                        Com o acompanhamento dos <span style={{ color: '#185a2e', fontWeight: 700 }}>Indicadores Antropométricos</span>, você terá clareza sobre seu progresso e metas. Conte com a <span style={{ color: '#185a2e', fontWeight: 700 }}>FittNutri</span> para serviços de <span style={{ color: '#185a2e', fontWeight: 700 }}>monitoramento</span>, <span style={{ color: '#ff9800', fontWeight: 700 }}>consultoria</span> e suporte em todas as etapas da sua jornada de saúde!
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 3 }}>Serviços de Nutricionismo</Typography>
                        <Box sx={{
                            display: 'grid',
                            gap: 1.2,
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
                        }}>
                            {servicos.map((serv, idx) => (
                                <Card key={idx} sx={{ display: 'flex', flexDirection: 'column', height: 140, minWidth: 200, p: 1, boxShadow: 2, background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)' }}>
                                    <Box sx={{ display: 'flex', gap: 1.2, flexGrow: 1, minHeight: 70 }}>
                                        <CardMedia component="img" image={serv.imagem} alt={serv.titulo} sx={{ width: 200, height: 180, borderRadius: 1.2, objectFit: 'cover', flexShrink: 0, ml: -1, mt: -3, mr: -4 }} />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                border: theme => `2px solid ${theme.palette.success.main}`,
                                                borderRadius: 2,
                                                pointerEvents: 'none',
                                                zIndex: 2
                                            }}
                                        />
                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', pr: 1 }}>
                                            <Typography variant="h6" fontWeight={700} noWrap sx={{ fontSize: '1.2rem', textAlign: 'right' }}>{serv.titulo}</Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', textAlign: 'right' }}>{serv.descricao}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 0.7, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            sx={{ minWidth: 70, fontSize: '0.9rem', py: 0.7 }}
                                            onClick={() => {
                                                if (serv.titulo === 'Consulta Nutricional') {
                                                    navigate('/gestor');
                                                } else if (serv.titulo === 'Educação Alimentar') {
                                                    navigate('/diet');
                                                } else {
                                                    navigate('/dashboard');
                                                }
                                            }}
                                        >
                                            Ver serviço
                                        </Button>
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    </Box>
);
}