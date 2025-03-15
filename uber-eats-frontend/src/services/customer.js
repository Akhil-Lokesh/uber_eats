import API from './config';

// Customer profile
export const getCustomerProfile = () => {
  return API.get('/customer/profile');
};

export const updateCustomerProfile = (profileData) => {
  return API.put('/customer/profile', profileData);
};

export const updateProfilePicture = (formData) => {
  return API.post('/customer/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Favorites
export const getFavoriteRestaurants = () => {
  return API.get('/favorites');
};

export const addFavoriteRestaurant = (restaurantId) => {
  return API.post(`/favorites/${restaurantId}`);
};

export const removeFavoriteRestaurant = (restaurantId) => {
  return API.delete(`/favorites/${restaurantId}`);
};

export const checkIsFavorite = (restaurantId) => {
  return API.get(`/favorites/${restaurantId}/check`);
};

// Orders
export const getCustomerOrders = () => {
  return API.get('/customer/orders');
};

export const placeOrder = (orderData) => {
  return API.post('/customer/orders', orderData);
};