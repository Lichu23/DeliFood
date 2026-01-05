import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es 401 (no autorizado), limpiar token y redirigir
    // PERO NO redirigir si ya estamos en login/register o si es un error de login/register
    if (error.response?.status === 401) {
      const isAuthPage = typeof window !== 'undefined' &&
        (window.location.pathname === '/login' ||
         window.location.pathname === '/register' ||
         window.location.pathname.startsWith('/invite'));

      const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/invitations');

      // Solo redirigir si NO estamos en página de auth Y NO es un request de auth
      if (!isAuthPage && !isAuthRequest) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;