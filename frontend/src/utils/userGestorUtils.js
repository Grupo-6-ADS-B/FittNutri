// Funções utilitárias para o UserGestor

export const formatDateHuman = (dateString, timeString) => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} ${months[month - 1]} ${year} • ${timeString || '09:00'}`;
  } catch {
    return `${dateString} • ${timeString || '09:00'}`;
  }
};

export const getConsultationStatus = (dateString) => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const consultDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    consultDate.setHours(0, 0, 0, 0);

    if (consultDate.getTime() === today.getTime()) {
      return { icon: '🟢', label: 'Hoje', color: '#4caf50', bgColor: '#e8f5e9' };
    } else if (consultDate > today) {
      return { icon: '🔵', label: 'Próxima', color: '#2196f3', bgColor: '#e3f2fd' };
    } else {
      return { icon: '🔴', label: 'Atrasada', color: '#f44336', bgColor: '#ffebee' };
    }
  } catch {
    return { icon: '⚪', label: 'Data inválida', color: '#9e9e9e', bgColor: '#f5f5f5' };
  }
};

export const computeImc = (peso, altura) => {
  const p = parseFloat(String(peso).replace(',', '.'));
  const h = parseFloat(String(altura).replace(',', '.'));
  if (!p || !h) return "";
  const hm = h / 100;
  const imc = p / (hm * hm);
  return Number.isFinite(imc) ? imc.toFixed(1) : "";
};

export const startOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(date.setDate(diff));
  start.setHours(0,0,0,0);
  return start;
};

export const defaultUsers = [
  { id: 1, name: "André Goulart", email: "andre.goulart@example.com", telefone: "(11) 98765-4321", cidade: "São Paulo", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Carlos Lima", email: "carlos.lima@example.com", telefone: "(21) 91234-5678", cidade: "Rio de Janeiro", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Pedro Henrique", email: "pedro.henrique@example.com", telefone: "(31) 99876-5432", cidade: "Belo Horizonte", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Julia Carvalho", email: "julia.carvalho@example.com", telefone: "(41) 98765-1234", cidade: "Curitiba", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 5, name: "Lucas Oliveira", email: "lucas.oliveira@example.com", telefone: "(51) 91234-8765", cidade: "Porto Alegre", avatar: "https://i.pravatar.cc/150?img=4" },
];

export const circKeys = [
  "Circunferência Abdominal (cm)",
  "Circunferência Cintura (cm)",
  "Circunferência Quadril (cm)",
  "Circunferência Pulso (cm)",
  "Circunferência Panturrilha (cm)",
  "Circunferência Braço (cm)",
  "Circunferência Coxa (cm)",
  "Peso Ideal (kg)"
];

export const initialCirc = circKeys.reduce((acc, k) => ({ ...acc, [k]: "" }), {});
