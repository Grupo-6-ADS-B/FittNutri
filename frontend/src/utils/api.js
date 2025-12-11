import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Não envia o token para cadastro de usuário
  if (!(config.url === '/users' && config.method === 'post')) {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
