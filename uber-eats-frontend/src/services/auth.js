import API from './config';

/**
 * Customer signup
 */
export const customerSignup = async (userData) => {
  const response = await API.post('/auth/signup', {
    ...userData,
    role: 'customer'
  });

  // Store token if registration is successful
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
  }

  return response;
};

/**
 * Restaurant signup
 */
export const restaurantSignup = async (userData) => {
  const response = await API.post('/auth/signup', {
    ...userData,
    role: 'restaurant'
  });

  // Store token if registration is successful
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
  }

  return response;
};

/**
 * Customer login
 */
export const customerLogin = async (credentials) => {
  const response = await API.post('/auth/login', credentials);

  // Store token if login is successful
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
  }

  return response;
};

/**
 * Restaurant login
 */
export const restaurantLogin = async (credentials) => {
  const response = await API.post('/auth/login', credentials);

  // Store token if login is successful
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
  }

  return response;
};

/**
 * Admin login
 */
export const adminLogin = async (credentials) => {
  const response = await API.post('/auth/admin-login', credentials);

  // Store token if login is successful
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
  }

  return response;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const response = await API.get('/auth/current-user');
    return response;
  } catch (error) {
    // If getting current user fails, remove token
    localStorage.removeItem('authToken');
    throw error;
  }
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    await API.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token on logout
    localStorage.removeItem('authToken');
  }
};

export default {
  customerSignup,
  restaurantSignup,
  customerLogin,
  restaurantLogin,
  adminLogin,
  getCurrentUser,
  logout
};
