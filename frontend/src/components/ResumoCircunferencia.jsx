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

  return (
  <Box sx={{ minHeight: "100vh", backgroundImage: 'url(/verdes.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', display: "flex", flexDirection: "column" }}>
      <Header />
      <Paper elevation={4} sx={{ maxWidth: 1200, mx: "auto", mt: 6, p: 4, display: "flex", gap: 4, alignItems: 'flex-start' }}>
        {/* Coluna esquerda: dados e gráfico */}
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
