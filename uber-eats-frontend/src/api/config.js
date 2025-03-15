// In config.js
import axios from 'axios';

// Create an axios instance with default configurations
const API = axios.create({
  baseURL: 'http://localhost:3001', // Backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Add a request interceptor to include auth token if available
API.interceptor;

// Add a request interceptor to include auth token if available
API.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      // Don't log the entire config to avoid flooding console with large files
      const { url, method, headers } = config;
      console.log(`[API Request] ${method.toUpperCase()} ${url}`);
      
      // For multipart/form-data requests, don't modify the headers
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        // Just log that we're sending a file, but don't modify anything
        console.log('Sending multipart form data');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle session expiration or auth errors
    if (error.response) {
      console.error(`[API Error] ${error.response.status} ${error.config?.url}: ${error.response.data?.message || error.message}`);
      
      if (error.response.status === 401) {
        // Session expired or unauthorized
        console.log('Authentication error, redirecting to login');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        // Forbidden (wrong user type)
        console.log('Permission denied');
      }
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;