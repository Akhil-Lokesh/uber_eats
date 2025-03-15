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
  return API.get('/customer/favorites');
};

export const addFavoriteRestaurant = (restaurantId) => {
  return API.post(`/customer/favorites/${restaurantId}`);
};

export const removeFavoriteRestaurant = (restaurantId) => {
  return API.delete(`/customer/favorites/${restaurantId}`);
};

// Orders
export const getCustomerOrders = () => {
  return API.get('/customer/orders');
};

export const placeOrder = (orderData) => {
  return API.post('/customer/orders', orderData);
};