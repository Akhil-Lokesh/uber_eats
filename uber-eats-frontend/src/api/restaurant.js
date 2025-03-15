import API from './config';

// Public routes
export const getAllRestaurants = () => {
  return API.get('/restaurants'); // Changed to plural
};

export const getRestaurantById = (restaurantId) => {
  return API.get(`/restaurants/${restaurantId}`); // Changed to plural
};

export const getRestaurantMenu = (restaurantId) => {
  return API.get(`/restaurants/${restaurantId}/menu`); // Changed to plural
};

// Restaurant profile management (protected)
export const getRestaurantProfile = async () => {
  try {
    console.log('Fetching restaurant profile...');
    const response = await API.get('/restaurant/profile');
    console.log('Profile fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant profile:', error.response?.data || error.message);
    throw error;
  }
};

export const updateRestaurantProfile = async (profileData) => {
  try {
    console.log('Updating restaurant profile...');
    const response = await API.put('/restaurant/profile', profileData);
    console.log('Profile updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating restaurant profile:', error.response?.data || error.message);
    throw error;
  }
};

export const updateRestaurantImage = (formData) => {
  return API.post('/restaurant/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get all dishes for the restaurant
export const getRestaurantDishes = async () => {
  try {
    console.log('Fetching restaurant dishes...');
    const response = await API.get('/restaurant/dishes');
    console.log('Dishes fetched successfully:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching dishes:', error.response?.data || error.message);
    throw error;
  }
};

// Add a new dish
export const addDish = async (formData) => {
  try {
    console.log('Adding new dish...');
    
    // Log what we're sending
    console.log('FormData keys being sent:');
    for (let key of formData.keys()) {
      const value = formData.get(key);
      console.log(`- ${key}: ${key === 'image' ? 'File object' : value}`);
    }
    
    const response = await API.post('/restaurant/dishes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log('Dish added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding dish:', error.response?.data || error.message);
    throw error;
  }
};

// Update an existing dish
export const updateDish = async (dishId, formData) => {
  try {
    console.log(`Updating dish ${dishId}...`);
    
    // Log what we're sending
    console.log('FormData keys being sent:');
    for (let key of formData.keys()) {
      const value = formData.get(key);
      console.log(`- ${key}: ${key === 'image' ? 'File object' : value}`);
    }
    
    const response = await API.put(`/restaurant/dishes/${dishId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log('Dish updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating dish ${dishId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete a dish
export const deleteDish = async (dishId) => {
  try {
    console.log(`Deleting dish ${dishId}...`);
    const response = await API.delete(`/restaurant/dishes/${dishId}`);
    console.log('Dish deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting dish ${dishId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Export as an object for default import
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
  getRestaurantDishes
};