import axios from 'axios';
import { BASE_URL } from './config';

export const doctorInstance = axios.create({
    baseURL: BASE_URL,
});

doctorInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
); 