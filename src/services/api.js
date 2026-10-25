// File: src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Đổi thành URL Backend của bạn sau này
  timeout: 10000,
});

// Tự động đính kèm JWT access_token từ localStorage vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;