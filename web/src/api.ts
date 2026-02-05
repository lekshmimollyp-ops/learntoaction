import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);
