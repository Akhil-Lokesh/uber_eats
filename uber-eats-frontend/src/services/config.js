import axios from 'axios';

// Create an axios instance with default configurations
const API = axios.create({
  baseURL: 'http://localhost:3001/api', // Backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Add a request interceptor to include auth token if available
API.interceptors.request.use(
  (config) => {
    // You could add token logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session expiration or auth errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or handle auth error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;