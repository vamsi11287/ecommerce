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
            const errorMessage = error.response?.data?.message || '';
            console.log('🔒 Authentication failed:', errorMessage);
            
            // Clear stored authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Get current path
            const currentPath = window.location.pathname;
            
            // Don't redirect if already on login or customer pages
            if (!currentPath.includes('/login') && !currentPath.includes('/customer')) {
                // Show alert to user
                alert('Your session has expired. Please login again.');
                // Redirect to login page
                window.location.href = '/login';
            } else if (currentPath.includes('/customer') && !currentPath.startsWith('/customer/order')) {
                // If on customer portal (not tracking page), just show message
                console.log('Session expired on customer portal');
            }
        } else if (error.response?.status === 403) {
            // Forbidden - insufficient permissions
            console.log('🚫 Access forbidden');
            alert('You do not have permission to perform this action.');
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
    markAsTaken: (id) => api.post(`/orders/${id}/taken`),
    delete: (id) => api.delete(`/orders/${id}`),
    getReady: () => api.get('/orders/ready'),
    getStats: () => api.get('/orders/stats')
};

// Report APIs
export const reportAPI = {
    getAll: (params) => api.get('/reports', { params }),
    getByDate: (date) => api.get(`/reports/date/${date}`),
    getSummary: (params) => api.get('/reports/summary', { params })
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