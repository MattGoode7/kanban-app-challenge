import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  _id: string;
  name: string;
}

export type Board = {
  _id: string;
  name: string;
  columns: string[];
};

export const authApi = {
  register: async (name: string, password: string) => {
    const response = await api.post('/auth/register', { name, password });
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },
  login: async (name: string, password: string) => {
    const response = await api.post('/auth/login', { name, password });
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const boardsApi = {
  getBoards: async () => {
    const response = await api.get('/boards');
    return response.data;
  },
  createBoard: async (name: string) => {
    const response = await api.post('/boards', { name });
    return response.data;
  },
};

export default api; 