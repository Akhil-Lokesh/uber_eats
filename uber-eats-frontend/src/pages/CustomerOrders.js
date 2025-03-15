import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/customer';

const CustomerOrders = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCustomerOrders();
      
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        // Handle unexpected data format
        console.warn('Unexpected response format from API:', response);
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter orders based on active tab
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'active':
        return orders.filter(order => 
          ['New', 'Order Received', 'Preparing', 'Ready for Pickup', 'On the Way'].includes(order.status)
        );
      case 'past':
        return orders.filter(order => 
          ['Delivered', 'Picked Up', 'Cancelled'].includes(order.status)
        );
      default:
        return orders;
    }
  };
  
  // Format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Return the original string if parsing fails
    }
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Picked Up':
        return 'status-success';
      case 'On the Way':
      case 'Ready for Pickup':
        return 'status-primary';
      case 'New':
      case 'Order Received':
      case 'Preparing':
        return 'status-warning';
      case 'Cancelled':
        return 'status-danger';
      default:
        return 'status-secondary';
    }
  };
  
  // Format order items for display (omitting "No items in this order" message)
  const formatOrderItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return '';
    }
    
    // If there are more than 2 items, show the first 2 with a count of the rest
    if (items.length > 2) {
      const displayItems = items.slice(0, 2).map(item => `${item.quantity || 1}x ${item.name}`).join(', ');
      return `${displayItems} and ${items.length - 2} more item${items.length - 2 > 1 ? 's' : ''}`;
    }
    
    // Otherwise just show all items
    return items.map(item => `${item.quantity || 1}x ${item.name}`).join(', ');
  };
  
  // Ensure a value is a number before using toFixed
  const formatPrice = (price) => {
    try {
      // Handle different cases: number, string, null, undefined
      if (price === null || price === undefined) {
        return '0.00';
      }
      
      // If it's a string, try to parse it
      if (typeof price === 'string') {
        // Remove any non-numeric characters except dots
        const cleaned = price.replace(/[^\d.]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
      }
      
      // If it's already a number
      if (typeof price === 'number' && !isNaN(price)) {
        return price.toFixed(2);
      }
      
      // Default fallback
      return '0.00';
    } catch (e) {
      console.error('Error formatting price:', e, price);
      return '0.00';
    }
  };
  
  // Handle view details
  const viewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  
  // Handle order again
  const handleOrderAgain = (order) => {
    // Logic to reorder would go here
    console.log('Order again clicked for order:', order.id);
  };
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <div className="container-fluid p-0" style={{ marginTop: '56px' }}>
      <div className="container py-5 text-white">
        <h1 className="mb-4">Your Orders</h1>
        
        {/* Tab navigation */}
        <div className="d-flex border-bottom mb-4" style={{ borderColor: '#333 !important' }}>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders
          </button>
          <button 
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Orders
          </button>
          <button 
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Orders
          </button>
        </div>
        
        {/* Refresh button */}
        <div className="d-flex justify-content-end mb-4">
          <button 
            className="refresh-button"
            onClick={fetchOrders}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh Orders
          </button>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="d-flex justify-content-center p-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && !loading && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="card bg-dark text-center p-5 border-secondary">
            <div className="mb-3">
              <i className="bi bi-receipt fs-1 text-muted"></i>
            </div>
            <h3 className="mb-2">No orders found</h3>
            <p className="text-muted mb-4">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet."
                : activeTab === 'active'
                  ? "You don't have any active orders right now."
                  : "You don't have any past orders."}
            </p>
            <div>
              <Link to="/restaurants" className="btn btn-success px-4 py-2 rounded-pill">
                Browse Restaurants
              </Link>
            </div>
          </div>
        )}
        
        {/* Orders list */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="orders-list mb-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card mb-4">
                <div className="order-header d-flex justify-content-between align-items-center p-3 bg-black">
                  <div>
                    <div className="order-number">Order #{order.id}</div>
                    <div className="order-date text-muted small">{formatDate(order.created_at)}</div>
                  </div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <div className="restaurant-image me-3">
                        {order.restaurant_image ? (
                          <img 
                            src={order.restaurant_image} 
                            alt={order.restaurant_name || 'Restaurant'}
                            className="rounded-circle"
                            width="50"
                            height="50"
                          />
                        ) : (
                          <div className="placeholder-image d-flex align-items-center justify-content-center">
                            <i className="bi bi-building text-muted"></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="mb-1">{order.restaurant_name || 'Restaurant'}</h5>
                        {/* Only show items if they exist, no "No items" message */}
                        {formatOrderItems(order.items) && (
                          <p className="order-items text-muted mb-0">
                            {formatOrderItems(order.items)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">Total</div>
                      <div className="total-amount fs-5 fw-bold">${formatPrice(order.total_price)}</div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    {/* Only show View Details for non-cancelled orders */}
                    {order.status !== 'Cancelled' && (
                      <button 
                        className="btn btn-success px-3"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        View Details
                      </button>
                    )}
                    
                    {/* Show Order Again button for delivered or picked up orders */}
                    {(order.status === 'Delivered' || order.status === 'Picked Up') && (
                      <button 
                        className="btn btn-outline-light px-3"
                        onClick={() => handleOrderAgain(order)}
                      >
                        Order Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Embedded CSS */}
      <style jsx>{`
        .tab-button {
          background: transparent;
          border: none;
          color: #9CA3AF;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }
        
        .tab-button.active {
          color: white;
          font-weight: 500;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #06C167;
        }
        
        .tab-button:hover:not(.active) {
          color: white;
        }
        
        .refresh-button {
          background-color: transparent;
          border: 1px solid #06C167;
          color: #06C167;
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .refresh-button:hover {
          background-color: rgba(6, 193, 103, 0.1);
        }
        
        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .order-card {
          background-color: #121212;
          border: 1px solid #333;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }
        
        .order-status {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status-success {
          background-color: rgba(6, 193, 103, 0.2);
          color: #06C167;
        }
        
        .status-primary {
          background-color: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
        
        .status-warning {
          background-color: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }
        
        .status-danger {
          background-color: rgba(220, 38, 38, 0.2);
          color: #f87171;
        }
        
        .status-secondary {
          background-color: rgba(156, 163, 175, 0.2);
          color: #9CA3AF;
        }
        
        .placeholder-image {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #333;
        }
        
        .btn-success {
          background-color: #06C167;
          border-color: #06C167;
        }
        
        .btn-success:hover {
          background-color: #059956;
          border-color: #059956;
        }
      `}</style>
    </div>
  );
};

export default CustomerOrders;