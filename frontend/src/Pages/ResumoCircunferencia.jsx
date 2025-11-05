import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Paper, Card, CardMedia, IconButton, Tooltip, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from '@mui/icons-material/Edit';
 
export default function ResumoCircunferencia() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  const warning = theme.palette.warning.main;
  const error = theme.palette.error.main;
  const info = theme.palette.info.main;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;
  const navigate = useNavigate();
  const location = useLocation();
  const dados = location.state?.dados;

  const mockUsers = [
    { id: 1, name: "André Goulart", email: "andre.goulart@example.com", phone: "(11) 98765-4321", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", phone: "(21) 91234-5678", avatar: "https://i.pravatar.cc/150?img=2" },
  ];
  // Restaura usuário selecionado: prioriza state; senão usa lastUserId em localStorage; fallback para primeiro mock
  const initialSelectedUser = (() => {
    if (location.state?.user) return location.state.user;
    try {
      const lastId = localStorage.getItem('lastUserId');
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      if (lastId && Array.isArray(users)) {
        const u = users.find(x => String(x.id) === String(lastId));
        if (u) return u;
      }
    } catch {}
    return mockUsers[0];
  })();
  const [selectedUser, setSelectedUser] = React.useState(initialSelectedUser);
  const [usersList, setUsersList] = React.useState(() => {
    try { const s = localStorage.getItem('users'); return s ? JSON.parse(s) : mockUsers; } catch { return mockUsers; }
  });

  React.useEffect(() => {
    try {
      const s = localStorage.getItem('users');
      if (s) setUsersList(JSON.parse(s));
    } catch {}
  }, []);

  const [antropo, setAntropo] = React.useState(location.state?.antropoData || {});
  const [dadosCirc, setDadosCirc] = React.useState(location.state?.dados || {});

  React.useEffect(() => {
    if (location.state?.antropoData || location.state?.dados) return; 
    try {
      const uid = selectedUser?.id;
      if (!uid) return;
      const stored = localStorage.getItem(`questionario_${uid}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.antropoData) setAntropo(parsed.antropoData);
        if (parsed?.circData) setDadosCirc(parsed.circData);
      } else {
        setAntropo({});
        setDadosCirc({});
      }
    } catch { setAntropo({}); setDadosCirc({}); }
  }, [selectedUser?.id, location.state?.antropoData, location.state?.dados]);

  const handleChangeUser = (e) => {
    const uid = e.target.value;
    const found = (usersList || []).find(u => String(u.id) === String(uid));
    if (found) {
      setSelectedUser(found);
      try { localStorage.setItem('lastUserId', String(found.id)); } catch {}
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
  const calcularTMB = (peso, alturaCm, idade, sexo = "feminino", atividade = "sedentário") => {
    if (!peso || !alturaCm || !idade) return null;
    let tmbBase;
    if ((sexo || "").toLowerCase() === "masculino") {
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
    }[atividade] || 1.2;
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
    const sexo = (antropo.sexo || 'feminino').toString().toLowerCase();
    if (!peso || !alturaCm || !idade) return null;
    return calcularTMB(peso, alturaCm, idade, sexo, "sedentário");
  }, [antropo.peso, antropo.altura, antropo.idade]);

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

  return (
  <Box sx={{ minHeight: "90vh", background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%)', display: "flex", flexDirection: "column" }}>
  <Paper elevation={4} sx={{ maxWidth: 1200, mx: "auto", mt: 6, p: 4, display: "flex", gap: 4, alignItems: 'flex-start', flexDirection: 'column', bgcolor: 'grey.100' }}>
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
          <Paper elevation={3} sx={{ width: { xs: '100%', sm: 360, md: 400 }, p: 2, borderRadius: 3, alignSelf: 'flex-start', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {selectedUser.avatar ? (
              <Box component="img" src={selectedUser.avatar} alt={selectedUser.name} sx={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid', borderColor: 'success.main' }} />
            ) : (
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'success.main',
                  backgroundColor: 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'white',
                }}
              >
                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : <Box component="img" src="/avatar-default.png" alt="avatar" sx={{ width: 40, height: 40 }} />}
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selectedUser.name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser.phone}</Typography>
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
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
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
          <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
            {antropo && Object.entries(antropo).map(([key, value]) => (
              value ? <Typography key={`antropo-${key}`} variant="body2">{key}: {value}</Typography> : null
            ))}
            {dadosCirc && Object.entries(dadosCirc).map(([key, value]) => (
              value ? <Typography key={`circ-${key}`} variant="body2">{key}: {value}</Typography> : null
            ))}
          </Box>
          </Paper>

          <Box sx={{ flex: 2, minWidth: 0 }}>
          <Typography variant="h5" gutterBottom>Resumo dos Dados de Circunferência</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Aqui está um resumo dos dados mais importantes para sua avaliação nutricional.
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {(() => {
              const imcNum = imcValue ? parseFloat(imcValue) : null;
              let imcColor = info;
              if (imcNum != null) {
                if (imcNum < 18.5) imcColor = warning;
                else if (imcNum < 24.9) imcColor = success;
                else if (imcNum < 29.9) imcColor = warning;
                else imcColor = error;
              }
              return (
                <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
                  <Typography variant="subtitle1" color={textSecondary}>IMC</Typography>
                  <Typography variant="h4" sx={{ color: imcColor }}>{imcValue ?? '-'}</Typography>
                  <Typography variant="body2" color={textSecondary}>{imcClass}</Typography>
                </Paper>
              );
            })()}
            <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
              <Typography variant="subtitle1" color={textSecondary}>Taxa Metabólica Basal</Typography>
              <Typography variant="h4" sx={{ color: primary }}>{tmbValue ? `${tmbValue} kcal` : '-'}</Typography>
              <Typography variant="body2" color={textSecondary}>Estimativa</Typography>
            </Paper>
            {(() => {
              const pg = antropo.porcentagemGordura ? parseFloat(String(antropo.porcentagemGordura).replace(',', '.')) : null;
              const sexo = (antropo.sexo || 'feminino').toString().toLowerCase();
              const idade = parseFloat(String(antropo.idade || '').replace(',', '.'));

              const classificarGordura = (valor, sexo, idade) => {
                if (valor == null) return { status: 'Não informado', color: textSecondary, faixa: null };
                const age = Number.isFinite(idade) ? idade : 30;
                const isMasc = sexo.includes('masc');
                let status = 'Adequado';
                let color = success;
                if (isMasc) {
                  const obeso = age < 40 ? 25 : age < 60 ? 28 : 30;
                  const baixo = 8;
                  const elevadoIni = age < 40 ? 20 : age < 60 ? 22 : 25;
                  if (valor >= obeso) { status = 'Obesidade'; color = error; }
                  else if (valor >= elevadoIni) { status = 'Elevado'; color = warning; }
                  else if (valor < baixo) { status = 'Baixo'; color = warning; }
                  else { status = 'Adequado'; color = success; }
                } else {
                  const obeso = age < 40 ? 39 : age < 60 ? 40 : 42;
                  const baixo = 21;
                  const elevadoIni = age < 40 ? 33 : age < 60 ? 34 : 36;
                  if (valor >= obeso) { status = 'Obesidade'; color = error; }
                  else if (valor >= elevadoIni) { status = 'Elevado'; color = warning; }
                  else if (valor < baixo) { status = 'Baixo'; color = warning; }
                  else { status = 'Adequado'; color = success; }
                }
                return { status, color, faixa: `${sexo.includes('masc') ? 'M' : 'F'} • ${Number.isFinite(idade) ? `${idade}a` : 'idade não informada'}` };
              };

              const cls = classificarGordura(pg, sexo, idade);
              const tooltip = pg != null ? `Classificação: ${cls.status} (${pg}% gordura corporal). Baseado em sexo e idade.` : 'Percentual de gordura não informado.';

              return (
                <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
                  <Typography variant="subtitle1" color={textSecondary}>Percentual de Gordura</Typography>
                  <Tooltip title={tooltip} arrow>
                    <Typography variant="h4" sx={{ color: cls.color }}>{pg != null ? `${pg}%` : '-'}</Typography>
                  </Tooltip>
                  <Typography variant="body2" color={textSecondary}>{cls.status}</Typography>
                </Paper>
              );
            })()}
            <Paper elevation={2} sx={{ p: 2, minWidth: 220, flex: '1 1 220px', textAlign: 'center' }}>
              <Box sx={{ width: '100%', height: 140, position: 'relative', px: 1, my: 1 }}>
                <svg width="100%" height="100%" viewBox="0 0 240 140" preserveAspectRatio="none">
                  {(() => {
                    const W = 240, H = 140; const ml = 42, mr = 22, mt = 14, mb = 26;
                    const x1 = ml, x2 = W - mr;
                    const vals = [pesoAtual, pesoMeta].filter(v => typeof v === 'number');
                    if (vals.length === 0) {
                      return null;
                    }
                    let minV = Math.min(...vals); let maxV = Math.max(...vals);
                    if (!(isFinite(minV) && isFinite(maxV))) {
                      return null;
                    }
                    const padding = (maxV - minV) * 0.15 || 1;
                    minV -= padding;
                    maxV += padding;
                    if (minV === maxV) { minV -= 1; maxV += 1; }

                    const scaleY = (v) => mt + (H - mt - mb) * (1 - (v - minV) / (maxV - minV));
                    const y1 = typeof pesoAtual === 'number' ? scaleY(pesoAtual) : null;
                    const y2 = typeof pesoMeta === 'number' ? scaleY(pesoMeta) : null;
                    const steps = 2;
                    const stepVal = (maxV - minV) / steps;
                    const yTicks = Array.from({ length: steps + 1 }, (_, i) => minV + i * stepVal);
                    return (
                      <g>
                        {yTicks.map((t, i) => {
                          const y = scaleY(t);
                          return (
                            <g key={i}>
                              <line x1={ml} y1={y} x2={W-mr} y2={y} stroke={divider} strokeDasharray="3 3" />
                            </g>
                          );
                        })}
                        <line x1={ml} y1={H-mb} x2={W-mr} y2={H-mb} stroke={divider} />
                        {y1 != null && y2 != null && (
                          <polyline points={`${x1},${y1} ${x2},${y2}`} fill="none" stroke={primary} strokeWidth={2} />
                        )}
                        {y1 != null && (<circle cx={x1} cy={y1} r={4} fill={primary} />)}
                        {y2 != null && (<circle cx={x2} cy={y2} r={4} fill={success} />)}
            {y1 != null && (
                            <text x={x1} y={y1 - 6} textAnchor="middle" fill={primary} fontWeight="bold" fontSize="11">{pesoAtual} kg</text>
            )}
            {y2 != null && (
                            <text x={x2} y={y2 - 6} textAnchor="middle" fill={success} fontWeight="bold" fontSize="11">{pesoMeta} kg</text>
            )}
                        <text x={x1} y={H - 6} textAnchor="middle" fill={textSecondary} fontSize="8">Atual</text>
                        <text x={x2} y={H - 6} textAnchor="middle" fill={textSecondary} fontSize="8">Meta</text>
                      </g>
                    );
                  })()}
                </svg>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  {/* <Typography variant="caption" color="text.secondary">Atual{pesoAtual != null ? `: ${pesoAtual} kg` : ': —'}</Typography> */}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                  {/* <Typography variant="caption" color="text.secondary">Meta{pesoMeta != null ? `: ${pesoMeta} kg` : ': —'}</Typography> */}
                </Box>
              </Box>
            </Paper>
          </Box>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: -3 }}>Serviços de Nutricionismo</Typography>
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
                <Button variant="contained" color="primary" size="small" sx={{ minWidth: 100 }}>Ver serviço</Button>
              </Box>
            </Card>
          ))}
        </Box>

      </Paper>
    </Box>
  );
}