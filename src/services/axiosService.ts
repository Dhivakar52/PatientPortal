import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiUrl = import.meta.env.VITE_API_URL;

// 1. Axios Instance (Base URL + Headers)
const axiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor: Always reads the latest token from Zustand
axiosInstance.interceptors.request.use(
    (config) => {
        const storeToken = useAuthStore.getState().authToken;
        const fallbackToken = localStorage.getItem('authToken');
        const token = storeToken || fallbackToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Error handling)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/patient/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;