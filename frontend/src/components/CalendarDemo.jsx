"use client";
import * as React from "react";
import usePatientData from "./usePatientData";

function Calendar({ mode, selected, onSelect, className, captionLayout }) {
  return (
    <div className={className} style={{ padding: 16, borderRadius: 8, boxShadow: '0 2px 8px #eee', background: '#fff' }}>
      <p>Calendário (exemplo)</p>
      <input
        type="date"
        value={selected?.toISOString().slice(0, 10) || ''}
        onChange={e => onSelect(new Date(e.target.value))}
        style={{ fontSize: 16, padding: 4 }}
      />
    </div>
  );
}


export default function CalendarDemo({ pacienteId }) {
  const [date, setDate] = React.useState(new Date());
  
  const id = pacienteId || 1;
  const { weightHistory, consultationDays, loading, error } = usePatientData(id);

  
  function SimpleLineChart({ data }) {
    if (!data || data.length < 2) return <p>Sem dados suficientes</p>;
    
    const maxPeso = Math.max(...data.map(d => d.peso));
    const minPeso = Math.min(...data.map(d => d.peso));
    const width = 300, height = 120, padding = 30;
    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((d.peso - minPeso) * (height - 2 * padding)) / (maxPeso - minPeso || 1);
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={width} height={height} style={{ background: '#f9f9f9', borderRadius: 8 }}>
        <polyline points={points} fill="none" stroke="#1976d2" strokeWidth="3" />
        {data.map((d, i) => {
          const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
          const y = height - padding - ((d.peso - minPeso) * (height - 2 * padding)) / (maxPeso - minPeso || 1);
          return <circle key={i} cx={x} cy={y} r={4} fill="#1976d2" />;
        })}
        
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#aaa" />
        <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#aaa" />
        
        <text x={padding} y={height-5} fontSize="10" fill="#555">{data[0].date}</text>
        <text x={width-padding-30} y={height-5} fontSize="10" fill="#555">{data[data.length-1].date}</text>
        <text x={5} y={padding+10} fontSize="10" fill="#555">{maxPeso}kg</text>
        <text x={5} y={height-padding} fontSize="10" fill="#555">{minPeso}kg</text>
      </svg>
    );
  }

  
  function SimpleBarChart({ data }) {
    if (!data || data.length === 0) return <p>Sem dados</p>;
    
    const counts = {};
    data.forEach(d => {
      counts[d.date] = (counts[d.date] || 0) + 1;
    });
    const entries = Object.entries(counts);
    const maxCount = Math.max(...entries.map(e => e[1]));
    const width = 300, height = 100, barWidth = 20, padding = 30;
    return (
      <svg width={width} height={height} style={{ background: '#f9f9f9', borderRadius: 8 }}>
        {entries.map(([date, count], i) => {
          const x = padding + i * (barWidth + 10);
          const barHeight = ((count / maxCount) * (height - 2 * padding));
          return (
            <g key={date}>
              <rect x={x} y={height-padding-barHeight} width={barWidth} height={barHeight} fill="#43a047" />
              <text x={x+barWidth/2} y={height-padding+12} fontSize="10" fill="#555" textAnchor="middle">{date.slice(5)}</text>
              <text x={x+barWidth/2} y={height-padding-barHeight-5} fontSize="10" fill="#555" textAnchor="middle">{count}</text>
            </g>
          );
        })}
        {/* Eixos */}
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#aaa" />
      </svg>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow-sm"
        captionLayout="dropdown"
      />
      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Evolução do Peso</h3>
        {loading ? <p>Carregando gráfico...</p> : error ? <p>Erro ao carregar dados</p> : <SimpleLineChart data={weightHistory} />}
      </div>
      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Dias de Consultas</h3>
        {loading ? <p>Carregando gráfico...</p> : error ? <p>Erro ao carregar dados</p> : <SimpleBarChart data={consultationDays} />}
      </div>
    </div>
  );
}
