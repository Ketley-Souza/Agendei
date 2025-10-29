import axios from 'axios';
import util from './util';

const api = axios.create({
    baseURL: util.baseURL,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Token salvo após login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
