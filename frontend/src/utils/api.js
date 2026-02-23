import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fittnutri.duckdns.org/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  
  const isPublicEndpoint = 
    (config.url === '/users' && config.method === 'post') ||
    (config.url === '/users/login' && config.method === 'post');
  
  if (!isPublicEndpoint) {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
