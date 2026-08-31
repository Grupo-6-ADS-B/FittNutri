import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine,
  LineChart, Line,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

export function MiniSparkline({ data, color = '#43a047', height = 28 }) {
  if (!Array.isArray(data) || data.length < 2) {
    return <Box sx={{ height, display: 'flex', alignItems: 'center' }}>
      <Box sx={{ height: '1px', width: '100%', bgcolor: 'rgba(46,125,50,0.15)' }} />
    </Box>;
  }
  const series = data.map((v, i) => ({ i, v: Number(v) || 0 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.75}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WeightEvolutionChart({ data, pesoIdeal }) {
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
      <Paper
        elevation={0}
        sx={{
          p: 1.75,
          borderRadius: 2.5,
          minWidth: 170,
          border: '1px solid rgba(46, 125, 50, 0.08)',
          boxShadow: '0 12px 32px rgba(46, 125, 50, 0.10), 0 4px 8px rgba(16, 24, 40, 0.04)',
          backdropFilter: 'blur(8px)',
          bgcolor: 'rgba(255,255,255,0.95)',
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{label}</Typography>
        <Typography variant="body1" fontWeight={800} color="primary.main" sx={{ fontSize: '1.35rem', letterSpacing: '-0.4px', mt: 0.25 }}>
          {current} kg
        </Typography>
        {variation !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: isDown ? '#2e7d32' : '#e65100', fontWeight: 700, fontSize: '0.78rem' }}
            >
              {isDown ? '↓' : '↑'} {Math.abs(parseFloat(variation))}% vs anterior
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43a047" stopOpacity={0.28} />
            <stop offset="60%" stopColor="#43a047" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#43a047" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(46, 125, 50, 0.08)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9aa39d' }}
          tickLine={false}
          axisLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9aa39d' }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
          width={42}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'rgba(46, 125, 50, 0.35)', strokeWidth: 1.25, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="peso"
          stroke="#43a047"
          strokeWidth={2.5}
          fill="url(#colorPeso)"
          dot={false}
          activeDot={{ r: 6, fill: '#43a047', stroke: '#fff', strokeWidth: 3 }}
          name="Peso (kg)"
        />
        {pesoIdeal && (
          <ReferenceLine
            y={pesoIdeal}
            stroke="#ff9800"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: `Meta: ${pesoIdeal} kg`, position: 'insideTopRight', fill: '#e65100', fontSize: 11, fontWeight: 700 }}
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
