import React from "react";
import { Box, Typography, Card, CardContent, CardMedia } from "@mui/material";

const servicos = [
  {
    titulo: "Consulta Nutricional",
    descricao: "Avaliação completa e plano alimentar personalizado.",
    imagem: "/descricao.jpg"
  },
  {
    titulo: "Acompanhamento Online",
    descricao: "Suporte remoto para dúvidas e ajustes no plano.",
    imagem: "/logo.jpg"
  },
  {
    titulo: "Educação Alimentar",
    descricao: "Workshops e materiais educativos sobre nutrição.",
    imagem: "/fundo.jpg"
  }
];

export default function ResumoServicosCarousel() {
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
