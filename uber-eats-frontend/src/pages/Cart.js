import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getRestaurantById } from '../services/restaurant';
import CartItem from '../components/common/CartItem';

const Cart = () => {
  const { cart, getCartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearingCart, setClearingCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch restaurant details if there are items in the cart
    const fetchRestaurantDetails = async () => {
      if (!cart.restaurantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch restaurant from API
        const response = await getRestaurantById(cart.restaurantId);
        const restaurantData = response.data;
        
        // Transform API response to match component structure
        const restaurantInfo = {
          id: cart.restaurantId,
          name: restaurantData.name,
          cuisine: restaurantData.cuisine || 'Various',
          deliveryFee: restaurantData.delivery_fee || 2.99,
          minOrder: restaurantData.min_order || 10,
          estimatedTime: '15-25 min', // Default if not provided
          address: restaurantData.location || '123 Main St, San Jose, CA 95112',
          imageUrl: restaurantData.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&w=200&q=80',
        };

        setRestaurant(restaurantInfo);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        
        // Create a fallback restaurant object if API fails
        setRestaurant({
          id: cart.restaurantId,
          name: 'Restaurant',
          cuisine: 'Various',
          deliveryFee: 2.99,
          minOrder: 10,
          estimatedTime: '15-25 min',
          address: 'Restaurant Address',
          imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&w=200&q=80',
        });
        
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [cart.restaurantId]);

  // Handle remove item from cart
  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  // Handle update item quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  // Handle clear cart with animation
  const handleClearCart = () => {
    setClearingCart(true);
    setTimeout(() => {
      clearCart();
      setClearingCart(false);
    }, 300);
  };

  // Calculate order totals
  const subtotal = getCartTotal();
  const deliveryFee = restaurant?.deliveryFee || 0;
  const tax = subtotal * 0.0875; // 8.75% tax rate
  const total = subtotal + deliveryFee + tax;
  
  // Check if minimum order amount is met
  const isMinimumMet = subtotal >= (restaurant?.minOrder || 0);

  // Handle checkout
  const handleCheckout = () => {
    if (cart.items.length > 0 && isMinimumMet) {
      navigate('/checkout');
    }
  };

  return (
    <div className="container py-5 mt-5" style={{ backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 76px)' }}>
      <h1 className="fs-2 fw-bold mb-4 text-white">Your Cart</h1>
      
      {loading ? (
        <div style={{ backgroundColor: '#121212', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : cart.items.length === 0 ? (
        <div style={{ 
          backgroundColor: '#121212', 
          borderRadius: '12px', 
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <i className="bi bi-cart-x fs-1 text-muted mb-3 d-block"></i>
          <h3 className="text-white mb-3">Your cart is empty</h3>
          <p className="text-muted mb-4">Add items from restaurants to get started.</p>
          <Link 
            to="/restaurants" 
            className="btn btn-success px-4 py-2"
            style={{ borderRadius: '50px', backgroundColor: '#06C167', border: 'none' }}
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="row">
          {/* Cart Items Section */}
          <div className="col-lg-8 mb-4 mb-lg-0">
            <div style={{ 
              backgroundColor: '#121212', 
              borderRadius: '12px', 
              overflow: 'hidden',
              border: '1px solid #333',
              marginBottom: '1.5rem'
            }}>
              <div style={{ 
                padding: '1rem 1.5rem', 
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div className="d-flex align-items-center">
                  {restaurant?.imageUrl && (
                    <img 
                      src={restaurant.imageUrl} 
                      alt={restaurant.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '1rem'
                      }}
                    />
                  )}
                  <h5 className="mb-0 text-white">
                    Order from <span className="fw-bold">{restaurant?.name}</span>
                  </h5>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClearCart}
                  disabled={clearingCart}
                  style={{ borderRadius: '50px' }}
                >
                  {clearingCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Clearing...
                    </>
                  ) : (
                    <>Clear Cart</>
                  )}
                </button>
              </div>
              
              <div>
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={handleUpdateQuantity}
                    removeFromCart={handleRemoveFromCart}
                  />
                ))}
              </div>
              
              <div style={{ padding: '1rem 1.5rem' }}>
                <Link 
                  to={`/restaurants/${restaurant?.id}`} 
                  className="text-success"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add more items
                </Link>
              </div>
            </div>
            
            {/* Restaurant Info */}
            <div style={{ 
              backgroundColor: '#121212', 
              borderRadius: '12px', 
              padding: '1.5rem',
              border: '1px solid #333'
            }}>
              <h5 className="text-white mb-3">Restaurant Information</h5>
              <div className="row">
                <div className="col-md-6 mb-3 mb-md-0">
                  <h6 className="text-muted mb-2">Address</h6>
                  <p className="text-white mb-0">{restaurant?.address}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-2">Estimated Delivery Time</h6>
                  <p className="text-white mb-0">{restaurant?.estimatedTime}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="col-lg-4">
            <div style={{ 
              backgroundColor: '#121212', 
              borderRadius: '12px', 
              border: '1px solid #333',
              position: 'sticky',
              top: '90px'
            }}>
              <div style={{ 
                padding: '1rem 1.5rem', 
                borderBottom: '1px solid #333'
              }}>
                <h5 className="text-white mb-0">Order Summary</h5>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Delivery Fee</span>
                  <span className="text-white">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <hr style={{ borderColor: '#333' }} />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold text-white">Total</span>
                  <span className="fw-bold text-white">${total.toFixed(2)}</span>
                </div>
                
                <button
                  className="btn w-100 py-2 mb-3"
                  onClick={handleCheckout}
                  disabled={!isMinimumMet}
                  style={{ 
                    backgroundColor: '#06C167', 
                    color: 'white',
                    borderRadius: '50px',
                    fontWeight: '500'
                  }}
                >
                  Proceed to Checkout
                </button>
                
                {!isMinimumMet && (
                  <div style={{ 
                    backgroundColor: '#2c2c2c', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                    Minimum order of ${restaurant?.minOrder.toFixed(2)} required. 
                    Add ${(restaurant?.minOrder - subtotal).toFixed(2)} more to proceed.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;