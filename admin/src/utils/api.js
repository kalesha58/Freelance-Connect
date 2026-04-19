import axios from 'axios';

const api = axios.create({
    baseURL: 'https://freelance-connect.vercel.app',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Let the browser set multipart boundary for FormData (required for /api/upload)
        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
