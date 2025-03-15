import React, { useState } from 'react';

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for orders
  const orders = [
    {
      id: '123456',
      date: 'March 1, 2023',
      time: '06:30 PM',
      status: 'Delivered',
      restaurant: 'Burger Palace',
      items: [
        { name: 'Classic Burger', quantity: 1, price: 9.99 },
        { name: 'French Fries', quantity: 1, price: 3.99 },
        { name: 'Chocolate Milkshake', quantity: 1, price: 5.99 }
      ],
      total: 19.97,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&w=120&h=120&q=80'
    },
    {
      id: '123457',
      date: 'February 25, 2023',
      time: '07:15 PM',
      status: 'Delivered',
      restaurant: 'Pizza Heaven',
      items: [
        { name: 'Pepperoni Pizza', quantity: 1, price: 14.99 },
        { name: 'Garlic Bread', quantity: 1, price: 4.99 },
        { name: 'Caesar Salad', quantity: 1, price: 7.99 }
      ],
      total: 27.97,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&w=120&h=120&q=80'
    },
    {
      id: '123458',
      date: 'March 8, 2025',
      time: '05:51 AM',
      status: 'On the Way',
      restaurant: 'Sushi World',
      items: [
        { name: 'Dragon Roll', quantity: 1, price: 15.99 },
        { name: 'California Roll', quantity: 1, price: 12.99 },
        { name: 'Miso Soup', quantity: 1, price: 3.99 }
      ],
      total: 32.97,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&w=120&h=120&q=80'
    }
  ];

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return order.status === 'On the Way' || order.status === 'Preparing';
    if (activeTab === 'past') return order.status === 'Delivered' || order.status === 'Cancelled';
    return true;
  });

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success';
      case 'On the Way':
        return 'bg-primary';
      case 'Preparing':
        return 'bg-warning';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid pt-4 pb-5" style={{ backgroundColor: '#000', marginTop: '56px' }}>
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-white fw-bold">Your Orders</h1>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-4 border-bottom border-dark">
        <ul className="nav nav-tabs border-0">
          <li className="nav-item">
            <button
              className={`nav-link border-0 px-4 ${activeTab === 'all' ? 'text-success border-bottom border-success' : 'text-secondary'}`}
              onClick={() => setActiveTab('all')}
            >
              All Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link border-0 px-4 ${activeTab === 'active' ? 'text-success border-bottom border-success' : 'text-secondary'}`}
              onClick={() => setActiveTab('active')}
            >
              Active Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link border-0 px-4 ${activeTab === 'past' ? 'text-success border-bottom border-success' : 'text-secondary'}`}
              onClick={() => setActiveTab('past')}
            >
              Past Orders
            </button>
          </li>
        </ul>
      </div>
      
      {/* Orders List */}
      <div className="row">
        <div className="col-12">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card bg-dark mb-4 border-0 rounded">
              {/* Order Header */}
              <div className="card-header bg-black d-flex justify-content-between align-items-center p-3 border-0">
                <div>
                  <p className="text-secondary mb-0 small">Order #{order.id} • {order.date} at {order.time}</p>
                </div>
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              {/* Order Content */}
              <div className="card-body bg-dark p-4">
                <div className="d-flex align-items-center mb-3">
                  <img 
                    src={order.imageUrl} 
                    alt={order.restaurant} 
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  <h5 className="card-title text-white mb-0">{order.restaurant}</h5>
                </div>
                
                {/* Order Items */}
                <div className="mb-3 pb-3 border-bottom border-secondary">
                  {order.items.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between text-light mb-2">
                      <span className="text-white-50">{item.quantity}x {item.name}</span>
                      <span className="text-white-50">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Order Total */}
                <div className="d-flex justify-content-between fw-bold text-white">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Order Actions */}
              <div className="card-footer bg-black border-0 p-3">
                <div className="row g-2">
                  <div className="col-6">
                    <button className="btn btn-success w-100">
                      View Restaurant
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-secondary w-100">
                      Order Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;