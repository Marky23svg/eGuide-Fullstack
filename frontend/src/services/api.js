import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auto-add token to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle responses globally - FIXED for login at "/"
API.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Check if this is a login or signup request
        const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                              error.config?.url?.includes('/auth/signup');
        
        // Only redirect for 401 errors on NON-auth endpoints
        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';  // ← Redirect to root (login page)
        }
        
        return Promise.reject(error.response?.data || error);
    }
);

// Auth endpoints
export const auth = {
    login: (email, password) => API.post('/auth/login', { email, password }),
    signup: (data) => API.post('/auth/signup', data),
};

// Requirements endpoints
export const requirements = {
    getAll: () => API.get('/requirements'),
    getOne: (id) => API.get(`/requirements/${id}`),
    create: (data) => API.post('/requirements', data),
    update: (id, data) => API.put(`/requirements/${id}`, data),
    delete: (id) => API.delete(`/requirements/${id}`),
};

// Announcements endpoints
export const announcements = {
    getAll: () => API.get('/announcements'),
    getOne: (id) => API.get(`/announcements/${id}`),
    create: (data) => API.post('/announcements', data),
    update: (id, data) => API.put(`/announcements/${id}`, data),
    delete: (id) => API.delete(`/announcements/${id}`),
};

// Saved requirements endpoints
export const saved = {
    save: (requirementId) => API.post(`/saved/${requirementId}`),
    getAll: () => API.get('/saved'),
    check: (requirementId) => API.get(`/saved/check/${requirementId}`),
    unsave: (requirementId) => API.delete(`/saved/${requirementId}`),
};

export default API;