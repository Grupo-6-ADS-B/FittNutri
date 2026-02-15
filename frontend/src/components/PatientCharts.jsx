import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export function WeightEvolutionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="peso" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ConsultationDaysChart({ data }) {

  const dayCounts = Object.values(data.reduce((acc, item) => {
    const day = item.date;
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {})).map((count, i) => ({ date: Object.keys(data.reduce((acc, item) => {
    const day = item.date;
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {}))[i], count }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={dayCounts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#43a047" barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}
