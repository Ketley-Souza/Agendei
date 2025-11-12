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

// Função auxiliar para gerar URL completa da imagem
export const urlImagem = (caminhoRelativo) => {
    if (!caminhoRelativo) return null;
    return `${util.baseURL}${caminhoRelativo}`;
};

export default api;
