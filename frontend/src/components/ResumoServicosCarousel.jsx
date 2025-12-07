import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CardMedia } from "@mui/material";
import api from '../utils/api';

export default function ResumoServicosCarousel() {
  const [servicos, setServicos] = useState([]);
  useEffect(() => {
    async function fetchServicos() {
      try {
        const response = await api.get('/servicos');
        setServicos(Array.isArray(response.data) ? response.data : []);
      } catch {
        setServicos([]);
      }
    }
    fetchServicos();
  }, []);
  return (
    <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
      {servicos.map((serv, idx) => (
        <Card key={idx} sx={{ minWidth: 260, maxWidth: 260, flex: '0 0 auto' }}>
          <CardMedia
            component="img"
            height="140"
            image={serv.imagem}
            alt={serv.titulo}
          />
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600}>{serv.titulo}</Typography>
            <Typography variant="body2" color="text.secondary">{serv.descricao}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
