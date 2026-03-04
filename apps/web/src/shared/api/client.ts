import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

// Injection automatique du Tenant ID et de l'Access Token
api.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('tenantId');
  const token = localStorage.getItem('accessToken');
  
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Gestion du rafraîchissement de token (Section 2.4)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Logique de refresh token via cookie HttpOnly côté API
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
