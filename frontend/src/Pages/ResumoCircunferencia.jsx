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

const KpiAnimatedCard = styled(Card)(({ theme, imageurl }) => ({
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    position: 'relative',
    height: 180,
    width: '100%',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(2),
    
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)',
        zIndex: 1,
    },
    
    '& .kpi-media': {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 100,
        backgroundImage: `url(${imageurl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        transform: 'translateX(20px)',
        zIndex: 2,
    },

    '& .MuiCardContent-root': {
        position: 'relative',
        zIndex: 3,
        flexGrow: 1,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        transform: 'translateX(0)',
    },

    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
        
        '& .kpi-media': {
            opacity: 1,
            transform: 'translateX(0)',
        },
        
        '& .MuiCardContent-root': {
            transform: 'translateX(-10px)',
        },
    },
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
    useEffect(() => {
        async function fetchData() {
            if (!selectedUser?.id) return;
            // Prioriza dados vindos do location.state
            if (location.state?.antropoData) {
                setAntropo(location.state.antropoData);
            } else {
                try {
                    const antropoRes = await api.get(`/anthropometric/${selectedUser.id}`);
                    setAntropo(antropoRes.data || {});
                } catch {
                    setAntropo({});
                }
            }
            if (location.state?.dados) {
                setDadosCirc(location.state.dados);
            } else {
                try {
                    const circRes = await api.get(`/circumference/${selectedUser.id}`);
                    setDadosCirc(circRes.data || {});
                } catch {
                    setDadosCirc({});
                }
            }
        }
        fetchData();
    }, [selectedUser?.id, location.state?.antropoData, location.state?.dados]);

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
        const peso = parseFloat(String(antropo.peso || '').replace(',', '.'));
        const alturaCm = parseFloat(String(antropo.altura || '').replace(',', '.'));
        if (!peso || !alturaCm) return null;
        const alturaM = alturaCm / 100;
        const v = calcularIMC(peso, alturaM);
        return v != null ? v.toFixed(2) : null;
    }, [antropo.peso, antropo.altura]);

    const imcClass = useMemo(() => {
        if (!imcValue) return "-";
        return classificarIMC(parseFloat(imcValue));
    }, [imcValue]);

    const tmbValue = useMemo(() => {
        const peso = parseFloat(String(antropo.peso || '').replace(',', '.'));
        const alturaCm = parseFloat(String(antropo.altura || '').replace(',', '.'));
        const idade = parseFloat(String(antropo.idade || '').replace(',', '.'));
        const sexoFonte = selectedUser?.sexo ?? 'feminino';
        const atividadeFonte = (selectedUser?.atividade ?? 'sedentario');
        if (!peso || !alturaCm || !idade) return null;
        return calcularTMB(peso, alturaCm, idade, sexoFonte, atividadeFonte);
    }, [antropo.peso, antropo.altura, antropo.idade, selectedUser?.sexo, selectedUser?.atividade]);

    const pesoAtual = useMemo(() => {
        const p = parseFloat(String(antropo.peso || '').replace(',', '.'));
        return Number.isFinite(p) && p > 0 ? parseFloat(p.toFixed(1)) : null;
    }, [antropo.peso]);

    const pesoMeta = useMemo(() => {
        const circ = location.state?.dados || dadosCirc;
        let metaValor = null;
        for (const [k, v] of Object.entries(circ)) {
            if (typeof k === 'string' && k.toLowerCase().includes('peso ideal')) {
                metaValor = v;
                break;
            }
        }
        if (metaValor == null) return null;
        const metaNum = parseFloat(String(metaValor).replace(',', '.').replace(/[^\d.]/g, ''));
        return Number.isFinite(metaNum) && metaNum > 0 ? parseFloat(metaNum.toFixed(1)) : null;
    }, [location.state, dadosCirc]);


    const servicos = [
        { titulo: "Consulta Nutricional", descricao: "Avaliação completa e plano alimentar personalizado.", imagem: "/tempo.jpg" },
        { titulo: "Acompanhamento Online", descricao: "Suporte remoto para dúvidas e ajustes no plano.", imagem: "/tempo2.jpg" },
        { titulo: "Educação Alimentar", descricao: "Workshops e materiais educativos sobre nutrição.", imagem: "/vendo.jpg" },
    ];


    
    const KpiLayout = () => {
        const kpis = [
            {
                title: "Peso Atual",
                value: pesoAtual != null ? pesoAtual.toString() : '-',
                unit: 'kg',
                description: 'Valor mais recente informado.',
                icon: ScaleIcon,
                imageId: 'pesoAtual',
                valueColor: success,
            },
            {
                title: "Meta de Peso (Ideal)",
                value: pesoMeta != null ? pesoMeta.toString() : '-',
                unit: 'kg',
                description: 'Objetivo de peso definido.',
                icon: TrendingUpIcon,
                imageId: 'pesoMeta',
                valueColor: success,
            },
            {
                title: "Índice de Massa Corporal",
                value: imcValue ?? '-',
                unit: '',
                description: imcClass,
                icon: FitnessCenterIcon,
                imageId: 'imc',
                valueColor: success,
            },
            {
                title: "Taxa Metabólica Basal",
                value: tmbValue ?? '-',
                unit: 'kcal/dia',
                description: 'Gasto calórico diário estimado.',
                icon: LocalFireDepartmentIcon,
                imageId: 'tmb',
                valueColor: '#ff9800', // Laranja
            },
        ];

        return (
            <Grid container spacing={2}>
                {kpis.map((kpi, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <KpiCarouselCard {...kpi} />
                    </Grid>
                ))}
            </Grid>
        );
    };

    
    const UserDetailDrawer = () => (
        <Drawer
            anchor="left"
            open={isCardOpen}
            onClose={() => setIsCardOpen(false)}
            sx={{
                '& .MuiDrawer-paper': { 
                    width: 340, 
                    boxSizing: 'border-box', 
                    p: 2, 
                    bgcolor: 'grey.100' 
                },
                zIndex: 1200
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <IconButton onClick={() => setIsCardOpen(false)} color="primary">
                    <MenuOpenIcon />
                </IconButton>
            </Box>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    bgcolor: 'white',
                }}
            >
                {selectedUser ? (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar 
                                src={selectedUser.avatar || ''} 
                                alt={selectedUser.name || 'Usuário'} 
                                sx={{ width: 56, height: 56, border: '2px solid', borderColor: success }} 
                            />
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selectedUser.name || 'Usuário'}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedUser.email || '-'}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedUser.phone || '-'}</Typography>
                            </Box>
                        </Box>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel id="select-user-label">Trocar usuário</InputLabel>
                            <Select
                                labelId="select-user-label"
                                value={selectedUser?.id ?? ''}
                                label="Trocar usuário"
                                onChange={handleChangeUser}
                            >
                                {(usersList || []).map(u => (
                                    <MenuItem key={u.id} value={u.id}>{u.id} - {u.name || 'Usuário'}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2">Informações preenchidas</Typography>
                            <Tooltip title="Editar dados">
                                <IconButton
                                    size="small"
                                    onClick={() => navigate('/questionario', { state: { user: selectedUser, antropoData: antropo || {}, dados: dadosCirc || {} } })}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1, mb: 2 }}>
                            {antropo && Object.entries(antropo).map(([key, value]) => (
                                value ? <Typography key={`antropo-${key}`} variant="body2">{key}: {value}</Typography> : null
                            ))}
                            {dadosCirc && Object.entries(dadosCirc).map(([key, value]) => (
                                value ? <Typography key={`circ-${key}`} variant="body2">{key}: {value}</Typography> : null
                            ))}
                        </Box>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ mt: 1, alignSelf: 'center', fontSize: '0.85rem', px: 2 }}
                            onClick={() => navigate('/gestor')}
                        >
                            Voltar para gerenciamento de usuários
                        </Button>
                    </>
                ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                        Nenhum usuário encontrado. Cadastre um usuário para visualizar os dados.
                    </Typography>
                )}
            </Paper>
        </Drawer>
    );

    
    const MinimalSidebar = () => {
        const iconSize = 40;
        const minimalAvatarSize = 40;

        return (
            <Box 
                sx={{ 
                    width: isSidebarOpen ? expandedWidth : minimalWidth, 
                    minWidth: isSidebarOpen ? expandedWidth : minimalWidth,
                    transition: theme.transitions.create(['width', 'min-width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }) + ', height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'grey.100', 
                    borderRight: '1px solid #e0e0e0',
                    p: 2,
                    position: 'sticky',
                    top: 0,
                    height: isSidebarOpen ? '70vh' : '15vh',
                    flexShrink: 0,
                    zIndex: 1000,
                    borderRadius: 2,
                    overflowX: 'hidden', 
                }}
            >
                <Box 
                    onClick={isSidebarOpen ? null : () => setIsCardOpen(true)}
                    sx={{ 
                        display: 'flex', 
                        flexDirection: isSidebarOpen ? 'row' : 'column',
                        justifyContent: isSidebarOpen ? 'space-between' : 'flex-start', 
                        alignItems: isSidebarOpen ? 'center' : 'center', 
                        py: 1, 
                        mb: 2, 
                        cursor: isSidebarOpen ? 'default' : 'pointer',
                        bgcolor: 'transparent',
                        height: 56, 
                    }}
                >
                    {!isSidebarOpen && (
                        <Tooltip title={selectedUser?.name || 'Usuário'} placement="right">
                             <Avatar 
                                src={selectedUser?.avatar || ''} 
                                alt={selectedUser?.name || 'Usuário'} 
                                sx={{ 
                                    width: minimalAvatarSize, 
                                    height: minimalAvatarSize, 
                                    border: '2px solid', 
                                    borderColor: success,
                                    mb: 1
                                }} 
                            />
                        </Tooltip>
                    )}
                    
                    <Tooltip title={isSidebarOpen ? "Comprimir Menu" : "Expandir Menu"} placement={isSidebarOpen ? "top" : "right"}>
                        <IconButton 
                            onClick={(e) => {
                                if (!isSidebarOpen) e.stopPropagation(); 
                                setIsSidebarOpen(!isSidebarOpen);
                            }} 
                            size="large" 
                            color="primary"
                            sx={!isSidebarOpen ? { mt: 0 } : {}}
                        >
                            {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {isSidebarOpen && (
                    <Box sx={{ minWidth: expandedWidth - 40 }}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 2, 
                                borderRadius: 3, 
                                bgcolor: 'transparent',
                                background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)',
                            
                            }}
                        >
                            {selectedUser ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Avatar src={selectedUser.avatar || ''} alt={selectedUser.name || 'Usuário'} sx={{ width: 56, height: 56, border: '2px solid', borderColor: success }} />
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selectedUser.name || 'Usuário'}</Typography>
                                            <Typography variant="body2" color="text.secondary">{selectedUser.email || '-'}</Typography>
                                            <Typography variant="body2" color="text.secondary">{selectedUser.phone || '-'}</Typography>
                                        </Box>
                                    </Box>
                                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                        <InputLabel id="select-user-label">Trocar usuário</InputLabel>
                                        <Select
                                            labelId="select-user-label"
                                            value={selectedUser?.id ?? ''}
                                            label="Trocar usuário"
                                            onChange={handleChangeUser}
                                        >
                                            {(usersList || []).map(u => (
                                                <MenuItem key={u.id} value={u.id}>{u.id} - {u.name || 'Usuário'}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2">Informações preenchidas</Typography>
                                        <Tooltip title="Editar dados">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate('/questionario', { state: { user: selectedUser, antropoData: antropo || {}, dados: dadosCirc || {} } })}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1, mb: 2 }}>
                                        {antropo && Object.entries(antropo).map(([key, value]) => (
                                            value ? <Typography key={`antropo-${key}`} variant="body2">{key}: {value}</Typography> : null
                                        ))}
                                        {dadosCirc && Object.entries(dadosCirc).map(([key, value]) => (
                                            value ? <Typography key={`circ-${key}`} variant="body2">{key}: {value}</Typography> : null
                                        ))}
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        sx={{ mt: 1, alignSelf: 'center', fontSize: '0.85rem', px: 2 }}
                                        onClick={() => navigate('/gestor')}
                                    >
                                        Voltar para gerenciamento de usuários
                                    </Button>
                                </>
                            ) : (
                                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                                    Nenhum usuário encontrado. Cadastre um usuário para visualizar os dados.
                                </Typography>
                            )}
                        </Paper>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ minHeight: "90vh", background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)', display: "flex", width: '100%' }}>
            <MinimalSidebar />
            <UserDetailDrawer />
            <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflowY: 'auto' }}>
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
                            <Typography variant="h5" gutterBottom>Resumo dos Dados de Circunferência</Typography>
                            <Typography variant="body1" sx={{ mb: 4 }}>
                                Aqui está um resumo dos dados mais importantes para sua avaliação nutricional.
                            </Typography>
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={7}>
                                    <Typography variant="h6" gutterBottom>Indicadores Antropométricos</Typography>
                                    <KpiLayout />
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <Paper elevation={0} sx={{ p: 3, height: '100%', borderLeft: '3px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
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
                                gap: 2,
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
                            }}>
                                {servicos.map((serv, idx) => (
                                    <Card key={idx} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 280, p: 1, boxShadow: 3 }}>
                                        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, minHeight: 80 }}>
                                            <CardMedia component="img" image={serv.imagem} alt={serv.titulo} sx={{ width: 100, height: 80, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }} />
                                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Typography variant="subtitle1" fontWeight={600} noWrap>{serv.titulo}</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{serv.descricao}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                sx={{ minWidth: 100 }}
                                                onClick={() => navigate('/dashboard')}
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