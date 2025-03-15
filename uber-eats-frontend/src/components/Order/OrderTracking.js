import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderById, cancelOrder } from '../services/order';

const OrderTracking = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Use ref to store interval ID for cleanup
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    
    // Set up interval for periodic updates
    intervalRef.current = setInterval(fetchOrderDetails, 30000); // Update every 30 seconds
    
    return () => {
      // Clear interval on component unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  // Function to check if order can be cancelled
  const canCancelOrder = () => {
    if (!order) return false;
    
    // Orders cannot be cancelled if they are already delivered, picked up, or cancelled
    const nonCancellableStatuses = ['Delivered', 'Picked Up', 'Cancelled'];
    return !nonCancellableStatuses.includes(order.status);
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await cancelOrder(id, cancelReason);
      
      // Update local state to reflect cancellation
      setOrder({
        ...order,
        status: 'Cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancelReason
      });
      
      // Show success message briefly
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Close modal
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // Function to get the progress width based on status
  const getProgressWidth = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'New':
      case 'Order Received':
        return '20%';
      case 'Preparing':
        return '40%';
      case 'Ready for Pickup':
        return '60%';
      case 'On the Way':
        return '80%';
      case 'Delivered':
      case 'Picked Up':
        return '100%';
      case 'Cancelled':
        return '0%';
      default:
        return '0%';
    }
  };

  // Function to get the progress value based on status
  const getProgressValue = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'New':
      case 'Order Received':
        return 20;
      case 'Preparing':
        return 40;
      case 'Ready for Pickup':
        return 60;
      case 'On the Way':
        return 80;
      case 'Delivered':
      case 'Picked Up':
        return 100;
      case 'Cancelled':
        return 0;
      default:
        return 0;
    }
  };

  // Function to get the status of a step
  const getStepStatus = (step, currentStatus) => {
    const statusOrder = ['Confirmed', 'New', 'Order Received', 'Preparing', 'Ready for Pickup', 'On the Way', 'Delivered', 'Picked Up'];
    
    // If order is cancelled, no step is active
    if (currentStatus === 'Cancelled') {
      return 'pending';
    }
    
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

  // Function to get status message
  const getStatusMessage = (status) => {
    switch (status) {
      case 'New':
      case 'Order Received':
      case 'Confirmed':
        return 'Your order has been received! The restaurant will start preparing it soon.';
      case 'Preparing':
        return 'The restaurant is now preparing your delicious meal.';
      case 'Ready for Pickup':
        return 'Your order is ready! A delivery partner will pick it up soon.';
      case 'On the Way':
        return 'Your food is on the way! It will arrive at your doorstep soon.';
      case 'Delivered':
      case 'Picked Up':
        return 'Your food has been delivered. Enjoy your meal!';
      case 'Cancelled':
        return 'This order has been cancelled.';
      default:
        return 'Your order is being processed.';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', marginTop: '-56px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle fs-1 text-danger mb-3"></i>
          <h2>Order Not Found</h2>
          <p className="text-muted mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Link to="/orders" className="btn btn-success">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="container py-4">
        {/* Back button */}
        <Link to="/orders" className="text-success text-decoration-none mb-4 d-inline-block">
          <i className="bi bi-arrow-left me-2"></i> Back to Orders
        </Link>
        
        {/* Success message */}
        {updateSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Order successfully cancelled.
            <button type="button" className="btn-close" onClick={() => setUpdateSuccess(false)}></button>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        
        <div className="row">
          {/* Order Tracking Section */}
          <div className="col-lg-8 mb-4 mb-lg-0">
            <div className="card bg-dark">
              <div className="card-body">
                <h5 className="card-title mb-4">Track Your Order</h5>
                
                {/* Order ID and Estimated Time */}
                <div className="d-flex justify-content-between mb-4">
                  <div>
                    <small className="text-muted">Order #</small>
                    <p className="mb-0 fw-bold">{order.id}</p>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">Estimated Arrival</small>
                    <p className="mb-0 fw-bold">{order.estimated_delivery_time || '05:24 AM - 05:39 AM'}</p>
                  </div>
                </div>
                
                {/* If order is cancelled, show cancelled state */}
                {order.status === 'Cancelled' ? (
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h3 className="text-danger mb-3">Order Cancelled</h3>
                    {order.cancellation_reason && (
                      <p className="mb-2">
                        <strong>Reason:</strong> {order.cancellation_reason}
                      </p>
                    )}
                    {order.cancelled_at && (
                      <p className="text-muted">
                        Cancelled at: {new Date(order.cancelled_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Progress Bar */}
                    <div className="progress mb-4" style={{ height: '8px' }}>
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
                          <p className={`mb-0 small ${order.status === 'Confirmed' || order.status === 'New' || order.status === 'Order Received' ? 'fw-bold' : ''}`}>
                            Confirmed
                          </p>
                        </div>
                        <div className="col">
                          <div className={`status-icon-container mb-2 ${getStepStatus('Preparing', order.status)}`}>
                            <i className="bi bi-fire status-icon"></i>
                          </div>
                          <p className={`mb-0 small ${order.status === 'Preparing' ? 'fw-bold' : ''}`}>
                            Preparing
                          </p>
                        </div>
                        <div className="col">
                          <div className={`status-icon-container mb-2 ${getStepStatus('Ready for Pickup', order.status)}`}>
                            <i className="bi bi-bag-check status-icon"></i>
                          </div>
                          <p className={`mb-0 small ${order.status === 'Ready for Pickup' ? 'fw-bold' : ''}`}>
                            Pickup Ready
                          </p>
                        </div>
                        <div className="col">
                          <div className={`status-icon-container mb-2 ${getStepStatus('On the Way', order.status)}`}>
                            <i className="bi bi-truck status-icon"></i>
                          </div>
                          <p className={`mb-0 small ${order.status === 'On the Way' ? 'fw-bold' : ''}`}>
                            On the Way
                          </p>
                        </div>
                        <div className="col">
                          <div className={`status-icon-container mb-2 ${getStepStatus('Delivered', order.status)}`}>
                            <i className="bi bi-house-door status-icon"></i>
                          </div>
                          <p className={`mb-0 small ${order.status === 'Delivered' || order.status === 'Picked Up' ? 'fw-bold' : ''}`}>
                            Delivered
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Current Status Message */}
                <div className="current-status-message mt-4 text-center">
                  <p className="mb-0">{getStatusMessage(order.status)}</p>
                </div>
                
                {/* Order Actions */}
                <div className="d-flex justify-content-center gap-3 mt-4">
                  {/* Show cancel button only if order can be cancelled */}
                  {canCancelOrder() && (
                    <button 
                      className="btn btn-outline-danger" 
                      onClick={() => setShowCancelModal(true)}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel Order
                    </button>
                  )}
                  
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-question-circle me-2"></i>
                    Help with my order
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary Section */}
          <div className="col-lg-4">
            <div className="card bg-dark">
              <div className="card-header bg-dark border-secondary">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="order-date mb-3">
                  <div className="text-muted mb-1">Order Date</div>
                  <div>{new Date(order.created_at).toLocaleString()}</div>
                </div>
                
                <hr className="border-secondary my-3" />
                
                {/* Order Items */}
                <div className="order-items mb-3">
                  <h6 className="mb-3">Items</h6>
                  {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between mb-2">
                      <div>
                        <span className="fw-bold text-success me-2">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <div>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  )) : (
                    <p className="text-muted">No items in this order</p>
                  )}
                </div>
                
                <hr className="border-secondary my-3" />
                
                {/* Order Totals */}
                <div className="order-totals mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <div>Subtotal</div>
                    <div>${order.subtotal ? order.subtotal.toFixed(2) : '13.98'}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <div>Tax</div>
                    <div>${order.tax ? order.tax.toFixed(2) : '1.22'}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <div>Delivery Fee</div>
                    <div>${order.delivery_fee ? order.delivery_fee.toFixed(2) : '2.99'}</div>
                  </div>
                  <div className="d-flex justify-content-between fw-bold mt-3">
                    <div>Total</div>
                    <div>${order.total_price ? order.total_price.toFixed(2) : '13.98'}</div>
                  </div>
                </div>
                
                <hr className="border-secondary my-3" />
                
                {/* Payment Method and Delivery Address */}
                <div className="payment-delivery mb-3">
                  <div className="mb-3">
                    <div className="text-muted mb-1">Payment Method</div>
                    <div>{order.payment_method || 'Credit Card'}</div>
                  </div>
                  <div>
                    <div className="text-muted mb-1">Delivery Address</div>
                    <div>{order.delivery_address || '1322 THE ALAMEDA, SAN JOSE, CA 95126-2684'}</div>
                  </div>
                </div>
                
                {/* Reorder Button - Only show if not cancelled */}
                {order.status !== 'Cancelled' && (
                  <button className="btn btn-success w-100 mt-3">
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Cancel Order</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this order?</p>
                <p className="text-danger small">This action cannot be undone.</p>
                
                <div className="form-group">
                  <label htmlFor="cancelReason">Reason for cancellation (optional):</label>
                  <textarea
                    id="cancelReason"
                    className="form-control bg-dark text-white border-secondary mt-2"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Order
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS for order tracking */}
      <style jsx>{`
        .status-icon-container {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          background-color: #333333;
          color: #9CA3AF;
        }
        
        .status-icon-container.completed {
          background-color: #06C167;
          color: #000;
        }
        
        .status-icon-container.current {
          background-color: #06C167;
          color: #000;
          box-shadow: 0 0 0 4px rgba(6, 193, 103, 0.2);
        }
        
        .status-steps {
          position: relative;
        }
        
        .current-status-message {
          background-color: #242424;
          padding: 1rem;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;