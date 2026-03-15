import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

export function WeightEvolutionChart({ data }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const current = payload[0].value;
    const idx = data.findIndex(d => d.date === label);
    const prev = idx > 0 ? data[idx - 1]?.peso : null;
    const variation = prev != null && prev !== 0
      ? (((current - prev) / prev) * 100).toFixed(1)
      : null;
    const isDown = variation !== null && parseFloat(variation) <= 0;

    return (
      <Paper elevation={4} sx={{ p: 1.5, borderRadius: 2, minWidth: 170, border: '1px solid #e8f5e9' }}>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.1rem' }}>
          {current} kg
        </Typography>
        {variation !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: isDown ? '#2e7d32' : '#e65100', fontWeight: 'bold', fontSize: '0.8rem' }}
            >
              {isDown ? '↓' : '↑'} {Math.abs(parseFloat(variation))}% vs anterior
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#43a047" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#43a047" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} />
        <YAxis tick={{ fontSize: 12, fill: '#888' }} domain={['auto', 'auto']} width={45} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Area
          type="monotone"
          dataKey="peso"
          stroke="#43a047"
          strokeWidth={3}
          fill="url(#colorPeso)"
          dot={{ r: 5, fill: '#ff9800', stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 7, fill: '#ff9800' }}
          name="Peso (kg)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ConsultationDaysChart({ data }) {
  const dayCounts = Object.values(data.reduce((acc, item) => {
    const day = item.date;
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {})).map((count, i) => ({
    date: Object.keys(data.reduce((acc, item) => {
      const day = item.date;
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {}))[i],
    count,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={dayCounts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="count" fill="#43a047" barSize={30} name="Consultas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
