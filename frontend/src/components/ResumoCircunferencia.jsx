import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Paper, Card, CardContent, CardMedia, IconButton, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function ResumoCircunferencia() {
  const navigate = useNavigate();
  const location = useLocation();
  const dados = location.state?.dados;

  const mockUsers = [
    { id: 1, name: "André Goulart", email: "andre.goulart@example.com", phone: "(11) 98765-4321", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", phone: "(21) 91234-5678", avatar: "https://i.pravatar.cc/150?img=2" },
  ];
  const selectedUser = location.state?.user || mockUsers[0];

  const antropo = location.state?.antropoData || {};
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
    if (!peso || !alturaCm || !idade) return null;
    return calcularTMB(peso, alturaCm, idade, "feminino", "sedentário");
  }, [antropo.peso, antropo.altura, antropo.idade]);

  const servicos = [
    { titulo: "Consulta Nutricional", descricao: "Avaliação completa e plano alimentar personalizado.", imagem: "/descricao.jpg" },
    { titulo: "Acompanhamento Online", descricao: "Suporte remoto para dúvidas e ajustes no plano.", imagem: "/logo.jpg" },
    { titulo: "Educação Alimentar", descricao: "Workshops e materiais educativos sobre nutrição.", imagem: "/fundo.jpg" },
  ];

  return (
  <Box sx={{ minHeight: "100vh", backgroundImage: 'url(/resumo.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', display: "flex", flexDirection: "column" }}>
      <Header />
      <Paper elevation={4} sx={{ maxWidth: 1200, mx: "auto", mt: 6, p: 4, display: "flex", gap: 4, alignItems: 'flex-start' }}>
        {/* Coluna esquerda: card de usuário */}
  <Paper elevation={3} sx={{ width: 320, p: 2, borderRadius: 3, alignSelf: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box component="img" src={selectedUser.avatar} alt={selectedUser.name} sx={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #2e7d32' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selectedUser.name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser.phone}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">Informações preenchidas</Typography>
            <Tooltip title="Editar dados">
              <IconButton
                size="small"
                onClick={() => navigate('/questionario', { state: { user: selectedUser, antropoData: location.state?.antropoData || {}, dados: location.state?.dados || {} } })}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
            {location.state?.antropoData && Object.entries(location.state.antropoData).map(([key, value]) => (
              value ? <Typography key={`antropo-${key}`} variant="body2">{key}: {value}</Typography> : null
            ))}
            {location.state?.dados && Object.entries(location.state.dados).map(([key, value]) => (
              value ? <Typography key={`circ-${key}`} variant="body2">{key}: {value}</Typography> : null
            ))}
          </Box>
        </Paper>

        {/* Coluna central: dados e gráfico */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Typography variant="h5" gutterBottom>Resumo dos Dados de Circunferência</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Aqui está um resumo dos dados mais importantes para sua avaliação nutricional.
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
              <Typography variant="subtitle1">IMC</Typography>
              <Typography variant="h4" color="primary">{imcValue ?? '-'}</Typography>
              <Typography variant="body2" color="text.secondary">{imcClass}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
              <Typography variant="subtitle1">Taxa Metabólica Basal</Typography>
              <Typography variant="h4" color="primary">{tmbValue ? `${tmbValue} kcal` : '-'}</Typography>
              <Typography variant="body2" color="text.secondary">Estimativa</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
              <Typography variant="subtitle1">Percentual de Gordura</Typography>
              <Typography variant="h4" color="primary">{antropo.porcentagemGordura ? `${antropo.porcentagemGordura}%` : '-'}</Typography>
              <Typography variant="body2" color="text.secondary">{antropo.porcentagemGordura ? 'Informado' : 'Não informado'}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 220, flex: '1 1 220px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1">IMC (Gráfico)</Typography>
              <Box sx={{ width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(#1976d2 0% ${imcValue ? Math.min(100, (parseFloat(imcValue) / 40) * 100) : 0}%, #e0e0e0 ${imcValue ? Math.min(100, (parseFloat(imcValue) / 40) * 100) : 0}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="h5" color="white">{imcValue ?? '-'}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{imcValue ? `IMC: ${imcClass}` : 'Informe peso e altura'}</Typography>
            </Paper>
          </Box>
          {/* Botão de voltar removido; edição pelo ícone no card de usuário */}
        </Box>

        {/* Coluna direita: lista vertical de serviços */}
        <Box sx={{ flex: 1, minWidth: 260, maxWidth: 340 }}>
          <Typography variant="h6" gutterBottom>Serviços de Nutricionismo</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {servicos.map((serv, idx) => (
              <Card key={idx} sx={{ display: 'flex', gap: 2 }}>
                <CardMedia component="img" image={serv.imagem} alt={serv.titulo} sx={{ width: 90, height: 90 }} />
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{serv.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">{serv.descricao}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
