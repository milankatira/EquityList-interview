import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

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

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a 404 and redirect to login
    if (error.response && error.response.status === 401) {
      // Clear any authentication tokens or user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to the login page
      // Note: Redirecting on 404 might not always be the desired behavior,
      // as 404 typically means "resource not found" rather than an authentication issue.
      // Consider handling 401 (Unauthorized) or 403 (Forbidden) for authentication-specific redirects.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
