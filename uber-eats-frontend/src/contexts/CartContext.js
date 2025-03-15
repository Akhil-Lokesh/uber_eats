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
      return { success: false, error: 'You must be logged in to place an order' };
    }
    
    // Validate cart contents
    if (cart.items.length === 0 || !cart.restaurantId) {
      setOrderStatus({
        loading: false,
        error: 'Your cart is empty',
        success: false
      });
      return { success: false, error: 'Your cart is empty' };
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