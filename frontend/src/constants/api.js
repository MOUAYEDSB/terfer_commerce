export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const buildApiUrl = (path = '') => {
    if (!path) return API_URL;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
