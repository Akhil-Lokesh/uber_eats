import API from './config';

// Customer authentication
export const customerLogin = (credentials) => {
  return API.post('/auth/login', {
    ...credentials,
    role: 'customer'
  });
};

export const customerSignup = (userData) => {
  return API.post('/auth/signup', {
    ...userData,
    role: 'customer'
  });
};

// Restaurant authentication
export const restaurantLogin = (credentials) => {
  return API.post('/auth/login', {
    ...credentials,
    role: 'restaurant'
  });
};

export const restaurantSignup = (userData) => {
  return API.post('/auth/signup', {
    ...userData,
    role: 'restaurant'
  });
};

// Common authentication
export const logout = () => {
  return API.post('/auth/logout');
};

// Check if user is authenticated
export const checkSession = () => {
  return API.get('/auth/check-session');
};

// Get current user data
export const getCurrentUser = () => {
  return API.get('/auth/current-user');
};

export default {
  customerLogin,
  customerSignup,
  restaurantLogin,
  restaurantSignup,
  logout,
  checkSession,
  getCurrentUser
};