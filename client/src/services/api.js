import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/customer')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    verifyToken: () => api.get('/auth/verify')
};

// Order APIs
export const orderAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (orderData) => api.post('/orders', orderData),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    delete: (id) => api.delete(`/orders/${id}`),
    getReady: () => api.get('/orders/ready'),
    getStats: () => api.get('/orders/stats')
};

// Menu APIs
export const menuAPI = {
    getAll: (params) => api.get('/menu', { params }),
    getById: (id) => api.get(`/menu/${id}`),
    create: (itemData) => api.post('/menu', itemData),
    update: (id, itemData) => api.patch(`/menu/${id}`, itemData),
    delete: (id) => api.delete(`/menu/${id}`),
    getCategories: () => api.get('/menu/categories')
};

// Settings APIs
export const settingsAPI = {
    getAll: () => api.get('/settings'),
    getSetting: (key) => api.get(`/settings/${key}`),
    update: (settingData) => api.post('/settings', settingData),
    toggleCustomerOrdering: (enabled) => api.post('/settings/customer-ordering/toggle', { enabled }),
    isCustomerOrderingEnabled: () => api.get('/settings/customer-ordering/status')
};

export default api;