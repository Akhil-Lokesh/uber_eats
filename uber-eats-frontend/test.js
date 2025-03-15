auth.js
import API from './config';

// Common authentication with role distinction
export const login = (credentials) => {
  return API.post('/auth/login', credentials);
};

export const customerSignup = (userData) => {
  // Set the role to customer
  return API.post('/auth/signup', { ...userData, role: 'customer' });
};

export const restaurantSignup = (userData) => {
  // Set the role to restaurant
  return API.post('/auth/signup', { ...userData, role: 'restaurant' });
};

// Common authentication
export const logout = () => {
  return API.post('/auth/logout');
};

export const getCurrentUser = () => {
  return API.get('/auth/current-user');
};

AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, logout as apiLogout, getCurrentUser } from '../services/auth';

// Create a context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' or 'restaurant'
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await getCurrentUser();
        if (response.data.authenticated) {
          // If authenticated, fetch the user details based on userId and userRole
          setCurrentUser({
            id: response.data.userId,
            // We'll set minimal info here, and can fetch more details later if needed
            name: "User"
          });
          setUserType(response.data.userRole);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function with API call
  const handleLogin = async (credentials, type) => {
    try {
      const response = await login(credentials);
      const userData = response.data.user;
      setCurrentUser(userData);
      setUserType(userData.role);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    }
  };

  // Login success function (for direct setting, used in signup flow)
  const handleLoginSuccess = (userData, type) => {
    setCurrentUser(userData);
    setUserType(type);
  };

  // Logout function with API call
  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API success/failure
      setCurrentUser(null);
      setUserType(null);
    }
  };

  // Value object to be provided by the context
  const value = {
    currentUser,
    userType,
    isAuthenticated: !!currentUser,
    isCustomer: userType === 'customer',
    isRestaurant: userType === 'restaurant',
    handleLogin,
    handleLoginSuccess,
    handleLogout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

Login.js
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call the login API
      const result = await handleLogin({ email, password }, userType);
      
      if (result.success) {
        // Redirect to appropriate dashboard
        navigate(userType === 'customer' ? '/dashboard' : '/restaurant/dashboard');
      } else {
        setError(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  CustomerSignup.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Call the customer signup API
        const signupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };
        
        // Import and use the customerSignup function
        const { customerSignup } = await import('../services/auth');
        await customerSignup(signupData);
        
        // Login after successful signup
        const { login } = await import('../services/auth');
        const loginResponse = await login({
          email: formData.email,
          password: formData.password
        });
        
        // Handle successful login
        handleLoginSuccess(loginResponse.data.user, 'customer');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({
          ...errors,
          general: error.response?.data?.message || 'An error occurred during signup'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  RestaurantSignup.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep2()) {
      setIsSubmitting(true);
      
      try {
        // Call the restaurant signup API
        const signupData = {
          name: formData.restaurantName,
          email: formData.email,
          password: formData.password,
          location: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          cuisine: formData.cuisineType
        };
        
        // Import and use the restaurantSignup function
        const { restaurantSignup } = await import('../services/auth');
        await restaurantSignup(signupData);
        
        // Login after successful signup
        const { login } = await import('../services/auth');
        const loginResponse = await login({
          email: formData.email,
          password: formData.password
        });
        
        // Handle successful login
        handleLoginSuccess(loginResponse.data.user, 'restaurant');
        
        // Redirect to restaurant dashboard
        navigate('/restaurant/dashboard');
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({
          ...errors,
          general: error.response?.data?.message || 'An error occurred during signup'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  Restaurant Service API Updates

  import API from './config';

// Public routes
export const getAllRestaurants = () => {
  return API.get('/restaurants');
};

export const getRestaurantById = (restaurantId) => {
  return API.get(`/restaurants/${restaurantId}`);
};

export const getRestaurantMenu = (restaurantId) => {
  return API.get(`/restaurants/${restaurantId}/menu`);
};

// Restaurant profile management (protected)
export const getRestaurantProfile = () => {
  return API.get('/restaurant/profile');
};

export const updateRestaurantProfile = (profileData) => {
  return API.put('/restaurant/profile', profileData);
};

export const updateRestaurantImage = (formData) => {
  return API.post('/restaurant/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Dish management (protected)
export const getRestaurantDishes = () => {
  return API.get('/restaurant/dishes');
};

export const addDish = (dishData) => {
  return API.post('/restaurant/dishes', dishData);
};

export const updateDish = (dishId, dishData) => {
  return API.put(`/restaurant/dishes/${dishId}`, dishData);
};

export const deleteDish = (dishId) => {
  return API.delete(`/restaurant/dishes/${dishId}`);
};

// No separate endpoint for dish image in backend, so we'll merge this with addDish/updateDish
// Both add and update dish apis should handle multipart/form-data for the image

// Get restaurant orders
export const getRestaurantOrders = (status) => {
  return API.get(`/restaurant/orders${status ? `?status=${status}` : ''}`);
};

Customer Service API Updates

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

Order Service API Updates

import API from './config';

// Restaurant order management
export const getRestaurantOrders = (status) => {
  return API.get(`/restaurant/orders${status ? `?status=${status}` : ''}`);
};

export const updateOrderStatus = (orderId, status) => {
  return API.put(`/restaurant/orders/${orderId}/status`, { status });
};

// Used by both customer and restaurant to view a specific order
export const getOrderById = (orderId) => {
  return API.get(`/orders/${orderId}`);
};

CartContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { placeOrder } from '../services/customer';

// Create context
const CartContext = createContext();

// Create provider component
export const CartProvider = ({ children }) => {
  // Get auth context to check if user is logged in
  const { isAuthenticated } = useAuth();
  
  // Initialize cart from localStorage if available
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : { items: [], restaurantId: null };
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return { items: [], restaurantId: null };
    }
  };

  const [cart, setCart] = useState(loadCartFromStorage);
  const [orderStatus, setOrderStatus] = useState({ loading: false, error: null, success: false, orderId: null });

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [cart]);

  // Add item to cart
  const addToCart = (item, restaurantId) => {
    setCart((prevCart) => {
      // If the cart is empty or from a different restaurant, reset it
      if (prevCart.restaurantId !== restaurantId && prevCart.restaurantId !== null) {
        return {
          items: [{ ...item, quantity: 1 }],
          restaurantId,
        };
      }

      // Check if item already exists in cart
      const existingItemIndex = prevCart.items.findIndex((i) => i.id === item.id);

      if (existingItemIndex >= 0) {
        // If item exists, update its quantity
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };

        return {
          ...prevCart,
          items: updatedItems,
        };
      } else {
        // If item doesn't exist, add it with quantity 1
        return {
          ...prevCart,
          items: [...prevCart.items, { ...item, quantity: 1 }],
          restaurantId,
        };
      }
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) return; // Don't allow quantities below 1
    
    setCart((prevCart) => {
      const updatedItems = prevCart.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      
      return {
        ...prevCart,
        items: updatedItems
      };
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.id !== itemId);
      
      // If cart is now empty, reset restaurantId
      const restaurantId = updatedItems.length > 0 ? prevCart.restaurantId : null;
      
      return {
        items: updatedItems,
        restaurantId,
      };
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart({ items: [], restaurantId: null });
  };

  // Calculate cart total
  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  // Place order using API
  const checkout = async (deliveryAddress) => {
    // Require authentication
    if (!isAuthenticated) {
      setOrderStatus({
        loading: false,
        error: 'You must be logged in to place an order',
        success: false
      });
      return;
    }
    
    // Validate cart contents
    if (cart.items.length === 0 || !cart.restaurantId) {
      setOrderStatus({
        loading: false,
        error: 'Your cart is empty',
        success: false
      });
      return;
    }
    
    setOrderStatus({ loading: true, error: null, success: false });
    
    try {
      // Format items for the API
      const formattedItems = cart.items.map(item => ({
        dishId: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Calculate total price
      const totalPrice = getCartTotal();
      
      // Create order data for API
      const orderData = {
        restaurantId: cart.restaurantId,
        items: formattedItems,
        totalPrice,
        deliveryAddress
      };
      
      // Call the API
      const response = await placeOrder(orderData);
      
      // Handle successful order
      setOrderStatus({
        loading: false,
        error: null,
        success: true,
        orderId: response.data.orderId
      });
      
      // Clear the cart after successful order
      clearCart();
      
      return { success: true, orderId: response.data.orderId };
    } catch (error) {
      setOrderStatus({
        loading: false,
        error: error.response?.data?.message || 'An error occurred while placing your order',
        success: false
      });
      return { success: false, error: error.response?.data?.message || 'Order failed' };
    }
  };

  // Value object to be provided by the context
  const value = {
    cart,
    orderStatus,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    checkout
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook for using the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

we have to create Checkout page to work with the updated Cart API

Update the Favorites page to integrate with the API
useEffect(() => {
    // Fetch favorites from API
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { getFavoriteRestaurants } = await import('../services/customer');
        const response = await getFavoriteRestaurants();
        
        // Transform the API response data to match our component's expected format
        const favoriteRestaurants = response.data.map(favorite => ({
          id: favorite.restaurant_id,
          name: favorite.restaurant_name,
          cuisine: favorite.cuisine || 'Various',
          rating: 4.5, // Default rating if not available in API
          deliveryTime: '15-25 min', // Default delivery time if not available
          imageUrl: favorite.image || 'https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-1.2.1&w=500&q=80'
        }));
        
        setFavorites(favoriteRestaurants);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        // Set empty array on error
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  RestaurantList.js
  useEffect(() => {
    // Fetch restaurants data
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        
        // Import API functions
        const { getAllRestaurants } = await import('../services/restaurent');
        const { getFavoriteRestaurants } = await import('../services/customer');
        
        // Fetch all restaurants
        const response = await getAllRestaurants();
        
        // Fetch favorite restaurants to determine which ones are favorites
        let favorites = [];
        try {
          const favoritesResponse = await getFavoriteRestaurants();
          favorites = favoritesResponse.data.map(fav => fav.restaurant_id);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          // Continue even if favorites fail to load
        }
        
        // Transform the API response to match our component's expected format
        const restaurantList = response.data.map(restaurant => ({
          id: restaurant.restaurant_id,
          name: restaurant.name,
          cuisine: restaurant.cuisine || 'Various',
          rating: 4.5, // Default rating if not provided by API
          reviewCount: 100, // Default review count if not provided
          deliveryTime: '15-30 min', // Default delivery time if not provided
          deliveryFee: restaurant.delivery_fee || 2.99,
          minOrder: restaurant.min_order || 10,
          isOpen: true, // Default to open if not provided
          imageUrl: restaurant.image || 'https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-1.2.1&w=500&q=80',
          isFavorite: favorites.includes(restaurant.restaurant_id),
          priceRange: '$$', // Default price range if not provided
        }));
        
        // Extract unique cuisines for filtering
        const cuisines = [...new Set(restaurantList.map(restaurant => restaurant.cuisine))];
        
        setRestaurants(restaurantList);
        setFilteredRestaurants(restaurantList);
        setCuisineFilters(cuisines);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  RestaurantDetails.js

  useEffect(() => {
    // Fetch restaurant details and menu
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        
        // Import necessary service functions
        const { getRestaurantById, getRestaurantMenu } = await import('../services/restaurent');
        const { checkIsFavorite } = await import('../services/customer');
        
        // Fetch restaurant details
        const restaurantResponse = await getRestaurantById(id);
        const restaurantData = restaurantResponse.data;
        
        // Check if restaurant is in favorites
        let isFav = false;
        try {
          const favoriteResponse = await checkIsFavorite(id);
          isFav = favoriteResponse.data.isFavorite;
        } catch (error) {
          console.error('Error checking favorite status:', error);
          // Continue even if favorite check fails
        }
        
        // Fetch restaurant menu
        const menuResponse = await getRestaurantMenu(id);
        const menuData = menuResponse.data;
        
        // Transform the restaurant data to match component structure
        const restaurant = {
          id: parseInt(id),
          name: restaurantData.name,
          cuisine: restaurantData.cuisine || 'Various',
          rating: 4.5, // Default or can be calculated from reviews
          reviewCount: 100, // Default if not provided
          deliveryTime: '15-25 min', // Default if not provided
          deliveryFee: restaurantData.delivery_fee || 2.99,
          minOrder: restaurantData.min_order || 10,
          address: restaurantData.location || '123 Main St, San Jose, CA 95112',
          phone: restaurantData.phone || '(123) 456-7890',
          hours: `${restaurantData.open_time || '11:00 AM'} - ${restaurantData.close_time || '10:00 PM'}`,
          description: restaurantData.description || 'Delicious food served with care.',
          imageUrl: restaurantData.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&w=800&q=80',
          isFavorite: isFav,
        };
        
        // Transform the menu data
        const menu = menuData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          imageUrl: item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&w=500&q=80',
          isPopular: false, // Default if not provided
          isAvailable: item.is_available !== false, // Default to true if not specified
          dietary: [] // Default if not provided
        }));
        
        // Extract menu categories
        const categories = ['all', ...new Set(menu.map(item => item.category))];
        
        setRestaurant(restaurant);
        setMenu(menu);
        setMenuCategories(categories);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantDetails();
    }
  }, [id]);


  CustomerProfile.js

  useEffect(() => {
    // Fetch customer profile from API
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Import API function
        const { getCustomerProfile } = await import('../services/customer');
        const response = await getCustomerProfile();
        
        // Transform the API response to match our component structure
        const profileData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          address: response.data.address || '',
          city: response.data.city || '',
          state: response.data.state || '',
          zipCode: '', // Assuming zipCode is part of the address in the API
          country: response.data.country || 'USA',
          profileImage: response.data.profile_picture || null,
        };
        
        setProfileData(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // If API fails, use current user from auth as fallback
        if (currentUser) {
          setProfileData({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA',
            profileImage: null,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);


  RestaurantProfile.js

  useEffect(() => {
    // Fetch restaurant profile from API
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Import API function
        const { getRestaurantProfile } = await import('../services/restaurent');
        const response = await getRestaurantProfile();
        
        // Transform API response to match component structure
        const profile = response.data;
        const profileData = {
          id: profile.id,
          name: profile.name || currentUser?.name || 'Restaurant Name',
          email: profile.email || currentUser?.email || 'restaurant@example.com',
          phone: profile.phone || '',
          description: profile.description || '',
          cuisine: profile.cuisine || '',
          address: profile.location?.split(',')[0] || '',
          city: profile.location?.split(',')[1]?.trim() || '',
          state: profile.location?.split(',')[2]?.trim()?.split(' ')[0] || '',
          zipCode: profile.location?.split(',')[2]?.trim()?.split(' ')[1] || '',
          openingTime: profile.open_time || '',
          closingTime: profile.close_time || '',
          deliveryRadius: profile.delivery_radius || 5,
          minimumOrder: profile.min_order || 10,
          images: profile.image ? [profile.image] : [],
          logo: profile.image || 'https://via.placeholder.com/150?text=Logo',
        };

        setProfileData(profileData);
        
      } catch (error) {
        console.error('Error fetching restaurant profile:', error);
        
        // Fallback to basic info if API fails
        if (currentUser) {
          setProfileData({
            id: currentUser.id,
            name: currentUser.name || 'Restaurant Name',
            email: currentUser.email || 'restaurant@example.com',
            phone: '',
            description: '',
            cuisine: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            openingTime: '',
            closingTime: '',
            deliveryRadius: 5,
            minimumOrder: 10,
            images: [],
            logo: 'https://via.placeholder.com/150?text=Logo',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);


  CustomerOrders.js

  useEffect(() => {
    // Fetch orders data
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Import API function
        const { getCustomerOrders } = await import('../services/customer');
        const response = await getCustomerOrders();
        
        // Transform API response to match component structure
        const orders = response.data.map(order => ({
          id: order.id,
          date: new Date(order.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: new Date(order.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: order.status,
          restaurant: {
            id: order.restaurant_id,
            name: order.restaurant_name
          },
          items: order.items || [],
          total: order.total_price
        }));
        
        setOrders(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  OrderDetails.js

  useEffect(() => {
    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Import API function
        const { getOrderById } = await import('../services/order');
        const response = await getOrderById(id);
        
        // Transform API response to match component structure
        const orderData = response.data;
        
        const order = {
          id: orderData.id,
          status: orderData.status,
          dateCreated: orderData.created_at,
          estimatedDeliveryTime: getEstimatedDeliveryTime(orderData.created_at, orderData.status),
          date: formatDate(orderData.created_at),
          total: orderData.total_price,
          subtotal: calculateSubtotal(orderData.items),
          tax: orderData.total_price * 0.0875, // Assuming 8.75% tax rate
          deliveryFee: 2.99, // Default if not provided
          tip: 0, // Not tracked in API
          paymentMethod: 'Credit Card', // Not tracked in API
          address: orderData.delivery_address,
          items: orderData.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            modifications: []
          })),
          restaurant: {
            id: orderData.restaurant_id,
            name: orderData.restaurant_name,
            phone: '(123) 456-7890', // Default if not provided
            address: 'Restaurant Address', // Default if not provided
            imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&w=200&q=80' // Default if not provided
          },
          deliveryPerson: orderData.status === 'On the Way' ? {
            name: 'Delivery Partner',
            phone: '(555) 123-4567',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            vehicleInfo: 'Vehicle Information'
          } : null
        };
        
        setOrder(order);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);
  
  // Helper function to calculate subtotal from items
  const calculateSubtotal = (items) => {
    return items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };
  
  // Helper function to estimate delivery time based on status and order time
  const getEstimatedDeliveryTime = (createdAt, status) => {
    const orderDate = new Date(createdAt);
    
    // If order is delivered, return actual delivery time
    if (status === 'Delivered') {
      return 'Delivered';
    }
    
    // Add 30-45 minutes to order time for estimated delivery
    const estimatedMinTime = new Date(orderDate.getTime() + 30 * 60000);
    const estimatedMaxTime = new Date(orderDate.getTime() + 45 * 60000);
    
    return `${estimatedMinTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })} - ${estimatedMaxTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })}`;
  };

  MenuManagement.js

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        
        // Import API functions
        const { getRestaurantDishes } = await import('../services/restaurent');
        
        // Fetch restaurant dishes
        const dishesResponse = await getRestaurantDishes();
        const dishesData = dishesResponse.data;
        
        // Extract unique categories from dishes
        const dishCategories = [...new Set(dishesData.map(dish => dish.category))];
        const allCategories = ['Appetizers', 'Main Course', 'Sides', 'Drinks', 'Desserts'];
        
        // Combine API categories with default categories, removing duplicates
        const categoriesSet = new Set([...dishCategories, ...allCategories]);
        const categories = Array.from(categoriesSet);
        
        // Format dishes for component structure
        const dishes = dishesData.map(dish => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          ingredients: dish.ingredients || '',
          category: dish.category,
          imageUrl: dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          isAvailable: dish.is_available !== false // Default to true if not specified
        }));

        setDishes(dishes);
        setCategories(categories);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);


  OrderManagement.js

  useEffect(() => {
    // Mock data - replace with API call when backend is ready
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Import API function
        const { getRestaurantOrders } = await import('../services/restaurent');
        
        // Fetch orders
        const response = await getRestaurantOrders();
        const ordersData = response.data;
        
        // Transform API response to match component structure
        const orders = ordersData.map(order => ({
          id: order.id,
          customerName: order.customer_name,
          customerPhone: order.phone || '123-456-7890', // Default if not provided
          customerAddress: order.delivery_address,
          items: order.items || [],
          subtotal: calculateSubtotal(order.items),
          deliveryFee: 2.99, // Default if not provided
          tax: order.total_price * 0.0875, // Assuming 8.75% tax rate
          total: order.total_price,
          status: order.status,
          paymentMethod: 'Credit Card', // Default if not provided
          date: order.created_at,
          notes: order.notes || '',
        }));
        
        setOrders(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        
        // Set empty array on error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Helper function to calculate subtotal from items
  const calculateSubtotal = (items) => {
    return items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  Update the Login component to correctly handle login with the updated auth services

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call the login API
      const result = await handleLogin({ email, password }, userType);
      
      if (result.success) {
        // Redirect to appropriate dashboard
        navigate(userType === 'customer' ? '/dashboard' : '/restaurant/dashboard');
      } else {
        setError(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  Make sure the Navbar handles logout properly by connecting to the API

  // Handle logout
  const handleNavLogout = async () => {
    try {
      await handleLogout();
      // After successful logout, redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Handle logout error if needed
    }
  };
order.js - services

import API from './config';

// Restaurant order management
export const getRestaurantOrders = (status) => {
  return API.get(`/restaurant/orders${status ? `?status=${status}` : ''}`);
};

export const updateOrderStatus = (orderId, status) => {
  return API.put(`/restaurant/orders/${orderId}/status`, { status });
};

// Used by both customer and restaurant to view a specific order
export const getOrderById = (orderId) => {
  return API.get(`/orders/${orderId}`);
};

RestaurantDetails.js - services
import API from './config';

// Public routes
export const getAllRestaurants = () => {
  return API.get('/restaurants');
};

export const getRestaurantById = (restaurantId) => {
  return API.get(`/restaurants/${restaurantId}`);
};

export const getRestaurantMenu = (restaurantId) => {
  return API.get(`/restaurants/${restaurantId}/menu`);
};

// Restaurant profile management (protected)
export const getRestaurantProfile = () => {
  return API.get('/restaurant/profile');
};

export const updateRestaurantProfile = (profileData) => {
  return API.put('/restaurant/profile', profileData);
};

export const updateRestaurantImage = (formData) => {
  return API.post('/restaurant/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Dish management (protected)
export const getRestaurantDishes = () => {
  return API.get('/restaurant/dishes');
};

export const addDish = (dishData) => {
  return API.post('/restaurant/dishes', dishData);
};

export const updateDish = (dishId, dishData) => {
  return API.put(`/restaurant/dishes/${dishId}`, dishData);
};

export const deleteDish = (dishId) => {
  return API.delete(`/restaurant/dishes/${dishId}`);
};

// Get restaurant orders
export const getRestaurantOrders = (status) => {
  return API.get(`/restaurant/orders${status ? `?status=${status}` : ''}`);
};

export const updateOrderStatus = (orderId, status) => {
  return API.put(`/restaurant/orders/${orderId}/status`, { status });
};

customer.js - services

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

auth.js -services

import API from './config';

// Common authentication with role distinction
export const login = (credentials) => {
  return API.post('/auth/login', credentials);
};

export const customerSignup = (userData) => {
  // Set the role to customer
  return API.post('/auth/signup', { ...userData, role: 'customer' });
};

export const restaurantSignup = (userData) => {
  // Set the role to restaurant
  return API.post('/auth/signup', { ...userData, role: 'restaurant' });
};

// Common authentication
export const logout = () => {
  return API.post('/auth/logout');
};

export const getCurrentUser = () => {
  return API.get('/auth/current-user');
};