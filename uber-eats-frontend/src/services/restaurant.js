import API from './config';

// Public routes
export const getAllRestaurants = () => {
  return API.get('/restaurant'); // Changed from /restaurants
};

export const getRestaurantById = (restaurantId) => {
  return API.get(`/restaurant/${restaurantId}`); // Changed from /restaurants
};

export const getRestaurantMenu = (restaurantId) => {
  return API.get(`/restaurant/${restaurantId}/menu`); // Changed from /restaurants
};

// Restaurant profile management (protected)
export const getRestaurantProfile = () => {
  return API.get('/restaurant/profile'); // Changed from /restaurants
};

export const updateRestaurantProfile = (profileData) => {
  return API.put('/restaurant/profile', profileData); // Changed from /restaurants
};

export const updateRestaurantImage = (formData) => {
  return API.post('/restaurant/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }); // Changed from /restaurants
};

// Dish management (protected)
export const addDish = (dishData) => {
  return API.post('/restaurant/dishes', dishData); // Changed from /restaurants
};

export const updateDish = (dishId, dishData) => {
  return API.put(`/restaurant/dishes/${dishId}`, dishData); // Changed from /restaurants
};

export const deleteDish = (dishId) => {
  return API.delete(`/restaurant/dishes/${dishId}`); // Changed from /restaurants
};

export const uploadDishImage = (dishId, formData) => {
  return API.post(`/restaurant/dishes/${dishId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }); // Changed from /restaurants
};

// Get all dishes for the logged-in restaurant
export const getRestaurantDishes = () => {
  return API.get('/restaurant/dishes'); // Changed from /restaurants
};

// Restaurant order management
export const getRestaurantOrders = (status) => {
  return API.get(`/restaurant/orders${status ? `?status=${status}` : ''}`); // Changed from /restaurants
};

export const updateOrderStatus = (orderId, status) => {
  return API.put(`/restaurant/orders/${orderId}/status`, { status }); // Changed from /restaurants
};

export const getOrderDetails = (orderId) => {
  return API.get(`/restaurant/orders/${orderId}`); // Changed from /restaurants
};

export default {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getRestaurantProfile,
  updateRestaurantProfile,
  updateRestaurantImage,
  addDish,
  updateDish,
  deleteDish,
  uploadDishImage,
  getRestaurantDishes,
  getRestaurantOrders,
  updateOrderStatus,
  getOrderDetails
};