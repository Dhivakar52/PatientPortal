import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getApiUrl } from '@/config/appConfig';

// 1. Axios Instance (Base URL + Headers)
const axiosInstance = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Initializes the Axios instance baseURL from the loaded runtime config
 */
export function initializeApiConfig(apiUrl: string) {
    axiosInstance.defaults.baseURL = apiUrl;
}

const excludedApis = [
    '/api/generateotp',
    '/api/sendsmsrequest',
    '/api/validateotp'
];

function isExcludedUrl(url?: string): boolean {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
    return excludedApis.some((excluded) => {
        const norm = excluded.toLowerCase();
        const withoutSlash = norm.startsWith('/') ? norm.slice(1) : norm;
        return (
            cleanUrl === norm ||
            cleanUrl.endsWith(norm) ||
            cleanUrl === withoutSlash ||
            cleanUrl.endsWith(`/${withoutSlash}`)
        );
    });
}

// 2. Request Interceptor: Excludes auth headers for OTP/SMS endpoints, adds Bearer Token for authenticated APIs
axiosInstance.interceptors.request.use(
    (config) => {
        // Dynamically ensure baseURL from runtime configuration
        if (!config.baseURL) {
            config.baseURL = getApiUrl();
        }

        if (isExcludedUrl(config.url)) {
            if (config.headers) {
                if (typeof config.headers.delete === 'function') {
                    config.headers.delete('Authorization');
                    config.headers.delete('authorization');
                } else {
                    delete config.headers['Authorization'];
                    delete config.headers['authorization'];
                }
            }
        } else {
            const storeToken = useAuthStore.getState().authToken;
            const fallbackToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            const token = storeToken || fallbackToken;

            if (token && typeof token === 'string' && token.trim() !== '') {
                const bearer = `Bearer ${token.trim()}`;
                if (typeof config.headers.set === 'function') {
                    config.headers.set('Authorization', bearer);
                } else {
                    config.headers.Authorization = bearer;
                }
            }
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
            if (typeof window !== 'undefined' && window.location.pathname !== '/patient/login' && window.location.pathname !== '/') {
                window.location.href = '/patient/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;