import Axios from 'axios';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

// Request interceptor: attach auth bearer token and csrf token safely
axios.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = window.localStorage.getItem('pos_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
            if (match) {
                config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[2]);
            }
        }
    }
    return config;
});

// Response interceptor: handle 401 unauthorized cleanly
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                window.localStorage.removeItem('pos_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// High-speed In-flight Deduplication & Micro-cache Layer
const inFlightRequests = new Map();
const cache = new Map();
const CACHE_TTL_MS = 2500; // 2.5s TTL eliminates duplicate simultaneous requests across header & pages

const getCacheKey = (url, params) => `${url}_${params ? JSON.stringify(params) : ''}`;
const clearCache = () => cache.clear();

const originalGet = axios.get.bind(axios);
const originalPost = axios.post.bind(axios);
const originalPut = axios.put.bind(axios);
const originalDelete = axios.delete.bind(axios);
const originalPatch = axios.patch.bind(axios);

axios.get = function (url, config = {}) {
    if (config?.noCache) {
        return originalGet(url, config);
    }

    const key = getCacheKey(url, config?.params);
    const now = Date.now();

    // Check micro-cache
    const cached = cache.get(key);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return Promise.resolve({ ...cached.response, fromCache: true });
    }

    // Check in-flight promise (deduplication)
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key);
    }

    const promise = originalGet(url, config)
        .then((response) => {
            cache.set(key, { timestamp: Date.now(), response });
            return response;
        })
        .finally(() => {
            inFlightRequests.delete(key);
        });

    inFlightRequests.set(key, promise);
    return promise;
};

axios.post = function (...args) {
    clearCache();
    return originalPost(...args);
};

axios.put = function (...args) {
    clearCache();
    return originalPut(...args);
};

axios.delete = function (...args) {
    clearCache();
    return originalDelete(...args);
};

axios.patch = function (...args) {
    clearCache();
    return originalPatch(...args);
};

export default axios;