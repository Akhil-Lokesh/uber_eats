import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../services/order';

// Utility function to ensure a value is a number before using toFixed
const ensureNumber = (value, defaultValue = 0) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get order details from API
        const response = await getOrderById(id);
        const orderData = response.data;
        
        // Transform API response to match component structure
        const orderTotal = ensureNumber(orderData.total_price);
        
        const order = {
          id: orderData.id,
          status: orderData.status,
          dateCreated: orderData.created_at,
          estimatedDeliveryTime: getEstimatedDeliveryTime(orderData.created_at, orderData.status),
          date: formatDate(orderData.created_at),
          total: orderTotal,
          subtotal: calculateSubtotal(orderData.items),
          tax: orderTotal * 0.0875, // Assuming 8.75% tax rate
          deliveryFee: 2.99, // Default if not provided
          tip: ensureNumber(orderData.tip, 0), // Not tracked in API
          paymentMethod: orderData.payment_method || 'Credit Card', // Default if not provided
          address: orderData.delivery_address,
          items: orderData.items && Array.isArray(orderData.items) ? orderData.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: ensureNumber(item.quantity, 1),
            price: ensureNumber(item.price, 0),
            modifications: item.modifications || []
          })) : [],
          restaurant: {
            id: orderData.restaurant_id,
            name: orderData.restaurant_name || 'Restaurant Name',
            address: orderData.restaurant_address || 'Restaurant Address' // Default if not provided
          }
          // Delivery person information removed as requested
        };
        
        setOrder(order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again later.');
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
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = ensureNumber(item.price, 0);
      const quantity = ensureNumber(item.quantity, 1);
      return total + (price * quantity);
    }, 0) || 0;
  };
  
  // Helper function to estimate delivery time based on status and order time
  const getEstimatedDeliveryTime = (createdAt, status) => {
    if (!createdAt) return 'Unknown';
    
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 mt-5" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-fluid py-5 mt-5" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}>
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle fs-1 text-danger mb-3"></i>
          <h2>Order Not Found</h2>
          <p className="text-white-50 mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Link to="/orders" className="btn btn-success">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 mt-5" style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}>
      <div className="container">
        <div className="mb-4">
          <Link to="/orders" className="text-decoration-none text-success">
            <i className="bi bi-arrow-left me-2"></i> Back to Orders
          </Link>
        </div>
        
        <div className="row">
          {/* Order Tracking */}
          <div className="col-lg-8 mb-4 mb-lg-0">
            <div className="card" style={{ backgroundColor: '#121212', borderColor: '#333333' }}>
              <div className="card-body">
                <h5 className="card-title mb-4 text-white">Track Your Order</h5>
                
                {/* Order ID and Estimated Time */}
                <div className="d-flex justify-content-between mb-4">
                  <div>
                    <small className="text-muted">Order #</small>
                    <p className="mb-0 fw-bold text-white">{order.id}</p>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">Estimated Arrival</small>
                    <p className="mb-0 fw-bold text-white">{order.estimatedDeliveryTime}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="progress mb-4" style={{ height: '8px', backgroundColor: '#242424' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: getProgressWidth(order.status) }} 
                    aria-valuenow={getProgressValue(order.status)} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                
                {/* Status Steps */}
                <div className="status-steps">
                  <div className="row text-center">
                    <div className="col">
                      <div className={`status-icon-container mb-2 ${getStepStatus('Confirmed', order.status)}`}>
                        <i className="bi bi-check-circle status-icon"></i>
                      </div>
                      <p className={`mb-0 small ${order.status === 'Confirmed' ? 'fw-bold text-white' : 'text-white-50'}`}>Confirmed</p>
                    </div>
                    <div className="col">
                      <div className={`status-icon-container mb-2 ${getStepStatus('Preparing', order.status)}`}>
                        <i className="bi bi-fire status-icon"></i>
                      </div>
                      <p className={`mb-0 small ${order.status === 'Preparing' ? 'fw-bold text-white' : 'text-white-50'}`}>Preparing</p>
                    </div>
                    <div className="col">
                      <div className={`status-icon-container mb-2 ${getStepStatus('Ready for Pickup', order.status)}`}>
                        <i className="bi bi-bag-check status-icon"></i>
                      </div>
                      <p className={`mb-0 small ${order.status === 'Ready for Pickup' ? 'fw-bold text-white' : 'text-white-50'}`}>Ready</p>
                    </div>
                    <div className="col">
                      <div className={`status-icon-container mb-2 ${getStepStatus('On the Way', order.status)}`}>
                        <i className="bi bi-truck status-icon"></i>
                      </div>
                      <p className={`mb-0 small ${order.status === 'On the Way' ? 'fw-bold text-white' : 'text-white-50'}`}>On the Way</p>
                    </div>
                    <div className="col">
                      <div className={`status-icon-container mb-2 ${getStepStatus('Delivered', order.status)}`}>
                        <i className="bi bi-house-door status-icon"></i>
                      </div>
                      <p className={`mb-0 small ${order.status === 'Delivered' ? 'fw-bold text-white' : 'text-white-50'}`}>Delivered</p>
                    </div>
                  </div>
                </div>
                
                {/* Map area - only shown if order is on the way */}
                {order.status === 'On the Way' && (
                  <>
                    <div className="mt-4 text-center p-4" style={{ backgroundColor: '#242424', borderRadius: '8px' }}>
                      <i className="bi bi-map fs-2 text-muted"></i>
                      <p className="text-muted mb-0">Live delivery tracking</p>
                    </div>
                  </>
                )}
                
                {/* Current Status Message */}
                <div className="current-status-message mt-4 text-center">
                  <p className="mb-0 text-white">{getStatusMessage(order.status)}</p>
                </div>
                
                {/* Help Button */}
                <div className="text-center mt-4">
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-question-circle me-2"></i>
                    Help with my order
                  </button>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="card mt-4" style={{ backgroundColor: '#121212', borderColor: '#333333' }}>
              <div className="card-header bg-black text-white border-dark">
                <h5 className="mb-0">Order Items</h5>
              </div>
              <div className="card-body p-0">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="border-bottom border-dark p-3">
                      <div className="row align-items-center">
                        <div className="col-7">
                          <div className="d-flex align-items-center">
                            <div className="me-3 fw-bold text-success">{item.quantity}x</div>
                            <div>
                              <h6 className="mb-0 text-white">{item.name}</h6>
                              {item.modifications && item.modifications.length > 0 && (
                                <small className="text-white-50">
                                  {item.modifications.join(', ')}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-5 text-end">
                          <span className="fw-semibold text-white">${(ensureNumber(item.price) * ensureNumber(item.quantity)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">No items in this order</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="card" style={{ backgroundColor: '#121212', borderColor: '#333333' }}>
              <div className="card-header bg-black text-white border-dark">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-white-50">Order Date</span>
                  <span className="text-white">{order.date}</span>
                </div>
                
                <hr className="border-dark my-3" />
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white">Subtotal</span>
                  <span className="text-white">${ensureNumber(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white">Tax</span>
                  <span className="text-white">${ensureNumber(order.tax).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white">Delivery Fee</span>
                  <span className="text-white">${ensureNumber(order.deliveryFee).toFixed(2)}</span>
                </div>
                {order.tip > 0 && (
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-white">Tip</span>
                    <span className="text-white">${ensureNumber(order.tip).toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-dark" />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold text-white">Total</span>
                  <span className="fw-bold text-white">${ensureNumber(order.total).toFixed(2)}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-white-50">Payment Method</span>
                  <span className="text-white">{order.paymentMethod}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-white-50">Delivery Address</span>
                  <span className="text-white text-end">{order.address}</span>
                </div>
                
                <hr className="border-dark my-3" />
                
                <div className="d-grid">
                  <Link 
                    to={`/restaurants/${order.restaurant.id}`}
                    className="btn btn-success"
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Reorder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .status-icon-container {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        .status-icon-container.completed {
          background-color: #06C167;
          color: #000;
        }
        
        .status-icon-container.current {
          background-color: #3498db;
          color: #000;
        }
        
        .status-icon-container.pending {
          background-color: #333333;
          color: #999999;
        }
        
        .status-icon {
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

// Helper function to get progress bar width based on status
const getProgressWidth = (status) => {
  switch (status) {
    case 'Confirmed':
      return '20%';
    case 'Preparing':
      return '40%';
    case 'Ready for Pickup':
      return '60%';
    case 'On the Way':
      return '80%';
    case 'Delivered':
      return '100%';
    default:
      return '0%';
  }
};

// Helper function to get progress value based on status
const getProgressValue = (status) => {
  switch (status) {
    case 'Confirmed':
      return 20;
    case 'Preparing':
      return 40;
    case 'Ready for Pickup':
      return 60;
    case 'On the Way':
      return 80;
    case 'Delivered':
      return 100;
    default:
      return 0;
  }
};

// Helper function to get step status
const getStepStatus = (step, currentStatus) => {
  const statusOrder = [
    'Confirmed', 
    'Preparing', 
    'Ready for Pickup', 
    'On the Way', 
    'Delivered'
  ];
  const stepIndex = statusOrder.indexOf(step);
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  if (stepIndex < currentIndex) {
    return 'completed';
  } else if (stepIndex === currentIndex) {
    return 'current';
  } else {
    return 'pending';
  }
};

// Helper function to get status message
const getStatusMessage = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'Your order has been received! The restaurant will start preparing it soon.';
    case 'Preparing':
      return 'The restaurant is now preparing your delicious meal.';
    case 'Ready for Pickup':
      return 'Your order is ready! A delivery partner will pick it up soon.';
    case 'On the Way':
      return 'Your food is on the way! It will arrive at your doorstep soon.';
    case 'Delivered':
      return 'Your food has been delivered. Enjoy your meal!';
    default:
      return 'Your order is being processed.';
  }
};

export default OrderDetails;