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

export const getCurrentUser = () => {
  return API.get('/auth/current-user');
};

export default {
  customerLogin,
  customerSignup,
  restaurantLogin,
  restaurantSignup,
  logout,
  getCurrentUser
};