import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Box, Typography, Paper } from "@mui/material";
import Carousel from "./ResumoServicosCarousel";
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
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Informações preenchidas</Typography>
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
            {/* Cards de dados mockados */}
            <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
              <Typography variant="subtitle1">IMC</Typography>
              <Typography variant="h4" color="primary">23.5</Typography>
              <Typography variant="body2" color="text.secondary">Normal</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
              <Typography variant="subtitle1">Taxa Metabólica Basal</Typography>
              <Typography variant="h4" color="primary">1.550 kcal</Typography>
              <Typography variant="body2" color="text.secondary">Estimativa</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 180, flex: '1 1 180px', textAlign: 'center' }}>
              <Typography variant="subtitle1">Percentual de Gordura</Typography>
              <Typography variant="h4" color="primary">18%</Typography>
              <Typography variant="body2" color="text.secondary">Saudável</Typography>
            </Paper>
            {/* Gráfico mockado */}
            <Paper elevation={2} sx={{ p: 2, minWidth: 220, flex: '1 1 220px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1">IMC (Gráfico)</Typography>
              <Box sx={{ width: 120, height: 120, borderRadius: '50%', background: 'conic-gradient(#1976d2 0% 65%, #e0e0e0 65% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="h5" color="white">23.5</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">IMC dentro do normal</Typography>
            </Paper>
          </Box>
          <Button variant="contained" color="primary" onClick={() => navigate("/questionario")}>Voltar</Button>
        </Box>

        {/* Coluna direita: carrossel de serviços */}
        <Box sx={{ flex: 1, minWidth: 260, maxWidth: 340 }}>
          <Typography variant="h6" gutterBottom>Serviços de Nutricionismo</Typography>
          <Carousel />
        </Box>
      </Paper>
    </Box>
  );
}
