import API from './config';

// Restaurant order management
export const getRestaurantOrders = (status) => {
  return API.get(`/restaurant/orders${status ? `?status=${status}` : ''}`);
};

export const updateOrderStatus = (orderId, status) => {
  return API.put(`/restaurant/orders/${orderId}/status`, { status });
};

export const getOrderDetails = (orderId) => {
  return API.get(`/restaurant/orders/${orderId}`);
};

// Used by both customer and restaurant to view a specific order
export const getOrderById = (orderId) => {
  return API.get(`/orders/${orderId}`);
};