import API from './config';

// Status mapping for consistent display
const STATUS_API_TO_UI = {
  'New': 'New',
  'Order Received': 'Order Received',
  'Confirmed': 'Confirmed',
  'Preparing': 'Preparing',
  'Pick-up Ready': 'Pickup Ready',  // Key mapping from backend to frontend
  'Ready for Pickup': 'Pickup Ready', // Alternative backend format
  'On the Way': 'On the Way',
  'Delivered': 'Delivered',
  'Picked Up': 'Picked Up',
  'Cancelled': 'Cancelled'
};

const STATUS_UI_TO_API = {
  'New': 'New',
  'Order Received': 'Order Received',
  'Confirmed': 'Confirmed',
  'Preparing': 'Preparing',
  'Pickup Ready': 'Pick-up Ready',  // Key mapping from frontend to backend
  'On the Way': 'On the Way',
  'Delivered': 'Delivered',
  'Picked Up': 'Picked Up',
  'Cancelled': 'Cancelled'
};

// Helper functions for status conversion
const mapStatusToUI = (apiStatus) => {
  return STATUS_API_TO_UI[apiStatus] || apiStatus;
};

const mapStatusToAPI = (uiStatus) => {
  return STATUS_UI_TO_API[uiStatus] || uiStatus;
};

// Restaurant order management
export const getRestaurantOrders = async (status) => {
  try {
    const response = await API.get(`/restaurant/orders${status ? `?status=${status}` : ''}`);
    
    // Map all order statuses to UI format
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(order => ({
        ...order,
        status: mapStatusToUI(order.status)
      }));
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    throw error;
  }
};

// Updated to ensure proper status updates
export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to: ${status}`);
    
    // Map the frontend status to backend status
    const backendStatus = mapStatusToAPI(status);
    console.log(`Mapped status for API: ${backendStatus}`);
    
    const response = await API.put(`/restaurant/orders/${orderId}/status`, { status: backendStatus });
    
    // Log successful update
    console.log(`Successfully updated order status. Response:`, response.data);
    return response;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error.response?.data || error.message);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await API.get(`/restaurant/orders/${orderId}`);
    
    // Map status to UI format
    if (response.data) {
      response.data.status = mapStatusToUI(response.data.status);
    }
    
    return response;
  } catch (error) {
    console.error(`Error fetching order details for ${orderId}:`, error);
    throw error;
  }
};

// Used by both customer and restaurant to view a specific order
export const getOrderById = async (orderId) => {
  try {
    console.log(`Fetching details for order ${orderId}`);
    const response = await API.get(`/orders/${orderId}`);
    
    // Map status to UI format
    if (response.data) {
      response.data.status = mapStatusToUI(response.data.status);
    }
    
    console.log(`Order details fetched:`, response.data);
    return response;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Cancel an order
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await API.put(`/customer/orders/${orderId}/cancel`, { reason });
    return response;
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
};

export default {
  getRestaurantOrders,
  updateOrderStatus,
  getOrderDetails,
  getOrderById,
  cancelOrder
};