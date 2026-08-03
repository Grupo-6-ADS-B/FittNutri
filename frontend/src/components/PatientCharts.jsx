import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export function WeightEvolutionChart({ data, pesoIdeal }) {
  const theme = useTheme();
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
      <Paper elevation={4} sx={{ p: 1.5, borderRadius: 2, minWidth: 170, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.1rem' }}>
          {current} kg
        </Typography>
        {variation !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: isDown ? theme.palette.success.main : theme.palette.warning.main, fontWeight: 'bold', fontSize: '0.8rem' }}
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
            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={theme.palette.mode === 'dark' ? 0.35 : 0.25} />
            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
        <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} domain={['auto', 'auto']} width={45} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Area
          type="monotone"
          dataKey="peso"
          stroke={theme.palette.success.main}
          strokeWidth={3}
          fill="url(#colorPeso)"
          dot={{ r: 5, fill: theme.palette.warning.main, stroke: theme.palette.background.paper, strokeWidth: 2 }}
          activeDot={{ r: 7, fill: theme.palette.warning.main }}
          name="Peso (kg)"
        />
        {pesoIdeal && (
          <ReferenceLine
            y={pesoIdeal}
            stroke={theme.palette.warning.main}
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{ value: `Meta: ${pesoIdeal} kg`, position: 'insideTopRight', fill: theme.palette.warning.dark, fontSize: 12, fontWeight: 600 }}
          />
        )}
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
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="count" fill={theme.palette.success.main} barSize={30} name="Consultas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
