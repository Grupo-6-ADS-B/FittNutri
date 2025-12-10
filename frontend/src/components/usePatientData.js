import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function usePatientData(pacienteId) {
  const [weightHistory, setWeightHistory] = useState([]);
  const [consultationDays, setConsultationDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pacienteId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/anthropometric-data/paciente/${pacienteId}`),
      api.get(`/schedulings/patient/${pacienteId}`)
    ])
      .then(([weightRes, consultRes]) => {
        // Weight history: [{date, peso}]
        setWeightHistory(weightRes.data);
        // Consultation days: [{date, ...}]
        setConsultationDays(consultRes.data);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [pacienteId]);

  return { weightHistory, consultationDays, loading, error };
}
