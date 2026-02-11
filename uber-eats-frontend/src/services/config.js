import axios from 'axios';

// Create axios instance with configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000 // 15 second timeout
});

// Request interceptor - Add auth token
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - show error message
          console.error('Access forbidden:', data.message);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;

        case 422:
          // Validation error
          console.error('Validation error:', data.errors);
          break;

        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;

        default:
          console.error('API error:', data.message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
