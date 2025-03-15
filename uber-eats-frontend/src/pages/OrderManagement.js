import React, { useState, useEffect } from 'react';
import { getRestaurantOrders } from '../services/order';
import { Link } from 'react-router-dom';
import axios from 'axios';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Status counts for display in tabs
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    New: 0,
    Preparing: 0,
    'On the Way': 0,
    'Ready for Pickup': 0,
    Delivered: 0,
    'Picked Up': 0,
    Cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getRestaurantOrders();
      console.log('Orders fetched successfully:', response.data);
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
        
        // Calculate status counts
        const counts = {
          all: response.data.length,
          New: 0,
          Preparing: 0,
          'On the Way': 0,
          'Ready for Pickup': 0,
          Delivered: 0,
          'Picked Up': 0,
          Cancelled: 0
        };
        
        response.data.forEach(order => {
          if (counts[order.status] !== undefined) {
            counts[order.status]++;
          }
        });
        
        setStatusCounts(counts);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Failed to load orders: Invalid data format');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Direct API call to update order status - bypass the service
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setError(null);
      
      // Map the status to the exact format expected by the backend
      let backendStatus = newStatus;
      
      // Special handling for "Ready for Pickup" which seems to be the problematic one
      if (newStatus === 'Ready for Pickup') {
        backendStatus = 'Pick-up Ready'; // Try the format from backend docs
        console.log(`Mapped "Ready for Pickup" to "${backendStatus}"`);
      }
      
      console.log(`Updating order ${orderId} status to: "${backendStatus}"`);
      
      // Make direct API call instead of using the service
      const response = await axios.put(
        `http://localhost:3001/api/restaurant/orders/${orderId}/status`,
        { status: backendStatus },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('Status update response:', response);
      
      // Update the local state for immediate UI update
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus }; // Keep frontend display consistent
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Update status counts
      setStatusCounts(prevCounts => {
        const newCounts = { ...prevCounts };
        
        // Find the order that was updated
        const order = orders.find(o => o.id === orderId);
        if (order) {
          // Decrement the count for the old status
          if (newCounts[order.status] !== undefined) {
            newCounts[order.status] = Math.max(0, newCounts[order.status] - 1);
          }
          
          // Increment the count for the new status
          if (newCounts[newStatus] !== undefined) {
            newCounts[newStatus]++;
          }
        }
        
        return newCounts;
      });
      
      // Close the dropdown
      setStatusDropdownOpen(false);
      
      // Refresh orders after a delay to ensure everything is in sync
      setTimeout(() => fetchOrders(), 1000);
      
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      setError('Failed to update order status. Please try again.');
    }
  };

  // Filter orders based on the active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  // Get the appropriate badge class for each status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New':
        return 'bg-info';
      case 'Preparing':
        return 'bg-warning text-dark';
      case 'On the Way':
        return 'bg-primary';
      case 'Ready for Pickup':
        return 'bg-info';
      case 'Delivered':
        return 'bg-success';
      case 'Picked Up':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownOpen && !event.target.closest('.status-dropdown-container')) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusDropdownOpen]);

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 className="pt-5 pb-3 container">Order Management</h1>
      
      {/* Refresh Orders button at the top right */}
      <div className="position-absolute" style={{ top: '20px', right: '20px' }}>
        <button 
          className="btn btn-outline-success rounded-pill"
          onClick={fetchOrders}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Orders
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="alert alert-danger mx-4 alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {/* Status Filter Tabs */}
      <div className="container mb-4">
        <div className="d-flex flex-wrap gap-2">
          <Link 
            to="#" 
            className={`btn ${activeTab === 'all' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('all'); }}
          >
            All Orders
            <span className="ms-2">{statusCounts.all}</span>
          </Link>
          <Link 
            to="#" 
            className={`btn ${activeTab === 'New' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('New'); }}
          >
            New
            <span className="ms-2">{statusCounts.New}</span>
          </Link>
          <Link 
            to="#" 
            className={`btn ${activeTab === 'Preparing' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('Preparing'); }}
          >
            Preparing
            <span className="ms-2">{statusCounts.Preparing}</span>
          </Link>
          <Link 
            to="#" 
            className={`btn ${activeTab === 'On the Way' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('On the Way'); }}
          >
            On the Way
            <span className="ms-2">{statusCounts['On the Way']}</span>
          </Link>
          <Link 
            to="#" 
            className={`btn ${activeTab === 'Ready for Pickup' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('Ready for Pickup'); }}
          >
            Ready for Pickup
            <span className="ms-2">{statusCounts['Ready for Pickup']}</span>
          </Link>
          <Link 
            to="#" 
            className={`btn ${activeTab === 'Delivered' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('Delivered'); }}
          >
            Delivered
            <span className="ms-2">{statusCounts.Delivered}</span>
          </Link>
          <Link 
            to="#" 
            className={`btn ${activeTab === 'Picked Up' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('Picked Up'); }}
          >
            Picked Up
            <span className="ms-2">{statusCounts['Picked Up']}</span>
          </Link>
          <Link 
            to="#" 
            className={`btn ${activeTab === 'Cancelled' ? 'btn-success' : 'btn-outline-light'} rounded-pill`}
            onClick={(e) => { e.preventDefault(); setActiveTab('Cancelled'); }}
          >
            Cancelled
            <span className="ms-2">{statusCounts.Cancelled}</span>
          </Link>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="container">
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-clipboard-x fs-1 text-muted mb-3 d-block"></i>
            <h4>No orders found</h4>
            <p className="text-muted">
              {activeTab === 'all' 
                ? "You haven't received any orders yet." 
                : `You don't have any orders with status "${activeTab}".`}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name || 'Customer'}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>${parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="position-relative">
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-success">
                          <i className="bi bi-eye"></i> View
                        </button>
                        <div className="dropdown status-dropdown-container">
                          <button
                            className="btn btn-sm btn-outline-light dropdown-toggle"
                            onClick={() => {
                              setSelectedOrder(order.id);
                              setStatusDropdownOpen(!statusDropdownOpen);
                            }}
                          >
                            Update Status
                          </button>
                          {statusDropdownOpen && selectedOrder === order.id && (
                            <div className="dropdown-menu show position-absolute bg-dark" style={{ minWidth: '150px', border: '1px solid #333' }}>
                              <button
                                className="dropdown-item text-white bg-dark"
                                onClick={() => handleUpdateStatus(order.id, 'On the Way')}
                                disabled={order.status === 'On the Way'}
                              >
                                On the Way
                              </button>
                              <button
                                className="dropdown-item text-white bg-dark"
                                onClick={() => handleUpdateStatus(order.id, 'Ready for Pickup')}
                                disabled={order.status === 'Ready for Pickup'}
                              >
                                Ready for Pickup
                              </button>
                              <button
                                className="dropdown-item text-white bg-dark"
                                onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                                disabled={order.status === 'Delivered'}
                              >
                                Delivered
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;