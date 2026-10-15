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

// Exactly the 3 public endpoints that must NEVER receive an Authorization header
const excludedApis = [
    '/api/generateotp',
    '/api/sendsmsrequest',
    '/api/validateotp',
];

/**
 * Extracts and normalizes the URL pathname.
 * Handles absolute URLs, relative URLs, query parameters, and fragments.
 */
function extractPathname(url?: string): string {
    if (!url) return '';
    try {
        if (/^https?:\/\//i.test(url)) {
            return new URL(url).pathname.toLowerCase();
        }
    } catch {
        // Fall back to relative extraction if URL constructor fails
    }
    const cleanUrl = url.split('?')[0].split('#')[0].trim().toLowerCase();
    return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
}

/**
 * Checks whether the request URL matches any of the excluded public APIs.
 * Matches exact pathnames to avoid false positives with similar substrings.
 */
function isExcludedUrl(url?: string): boolean {
    if (!url) return false;
    const path = extractPathname(url);
    return excludedApis.some((excluded) => {
        const norm = excluded.toLowerCase().trim();
        const cleanNorm = norm.startsWith('/') ? norm : `/${norm}`;
        return path === cleanNorm || path === `${cleanNorm}/`;
    });
}

/**
 * Removes any Authorization header (case-insensitive) from request configuration.
 */
function removeAuthHeader(config: any): void {
    if (!config?.headers) return;
    if (typeof config.headers.delete === 'function') {
        config.headers.delete('Authorization');
        config.headers.delete('authorization');
    } else {
        delete config.headers['Authorization'];
        delete config.headers['authorization'];
    }
}

// 2. Request Interceptor: Automatically attaches Bearer token to all protected APIs
axiosInstance.interceptors.request.use(
    (config) => {
        // Dynamically ensure baseURL from runtime configuration
        if (!config.baseURL) {
            config.baseURL = getApiUrl();
        }

        // Ensure headers container exists
        if (!config.headers) {
            config.headers = axios.AxiosHeaders ? new axios.AxiosHeaders() : ({} as any);
        }

        if (isExcludedUrl(config.url)) {
            // Strictly exclude the 3 public endpoints from receiving Authorization
            removeAuthHeader(config);
        } else {
            // All other endpoints are protected by default: attach Bearer token
            const storeToken = useAuthStore.getState().authToken;
            const fallbackToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            const token = storeToken || fallbackToken;

            if (token && typeof token === 'string' && token.trim() !== '') {
                // Trim whitespace and remove existing "Bearer " prefix to avoid duplicate prefixes
                const cleanToken = token.trim().replace(/^Bearer\s+/i, '').trim();

                if (cleanToken !== '') {
                    const bearerValue = `Bearer ${cleanToken}`;
                    if (typeof config.headers.set === 'function') {
                        config.headers.set('Authorization', bearerValue);
                    } else {
                        config.headers.Authorization = bearerValue;
                    }
                } else {
                    removeAuthHeader(config);
                }
            } else {
                // Missing or invalid token: safely remove header; do NOT send Bearer null / undefined
                removeAuthHeader(config);

                if (import.meta.env.DEV) {
                    console.warn(`[AxiosAuth] Protected request to "${config.url || 'unknown'}" dispatched without an auth token.`);
                }
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Error handling, JSON parsing for text/plain & 401 logout)
axiosInstance.interceptors.response.use(
    (response) => {
        // Automatically parse text/plain responses that contain JSON arrays or objects
        if (typeof response.data === 'string' && response.data.trim() !== '') {
            const trimmed = response.data.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    response.data = JSON.parse(trimmed);
                } catch {
                    // Ignore parsing error, keep as raw string
                }
            }
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;