import axios from 'axios';
import util from './util';

const api = axios.create({
    baseURL: util.baseURL, // ex: http://localhost:5000
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Token salvo após login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Função auxiliar para retornar URL da imagem (apenas Cloudinary)
export const urlImagem = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : null;
};

export default api;
