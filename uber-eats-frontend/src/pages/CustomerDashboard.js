import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/customer';
import { getFavoriteRestaurants } from '../services/customer';
import { getAllRestaurants } from '../services/restaurant';

const CustomerDashboard = () => {
  const { currentUser, loading: authLoading } = useAuth();
  
  // State for hover effects
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredOrder, setHoveredOrder] = useState(null);
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick actions data
  const quickActions = [
    { 
      id: 'browse', 
      icon: 'bi-shop', 
      title: 'Browse Restaurants', 
      description: 'Discover new places to eat', 
      linkTo: '/restaurants', 
      buttonText: 'Explore' 
    },
    { 
      id: 'reorder', 
      icon: 'bi-arrow-repeat', 
      title: 'Reorder', 
      description: 'Quickly reorder your favorites', 
      linkTo: '/orders', 
      buttonText: 'My Orders' 
    },
    { 
      id: 'favorites', 
      icon: 'bi-heart', 
      title: 'Favorites', 
      description: 'View your saved restaurants', 
      linkTo: '/favorites', 
      buttonText: 'My Favorites' 
    },
    { 
      id: 'profile', 
      icon: 'bi-person', 
      title: 'My Profile', 
      description: 'Manage your account', 
      linkTo: '/profile', 
      buttonText: 'View Profile' 
    }
  ];

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch orders, favorites and restaurants in parallel
        const [ordersResponse, favoritesResponse, restaurantsResponse] = await Promise.all([
          getCustomerOrders(),
          getFavoriteRestaurants(),
          getAllRestaurants()
        ]);
        
        setOrders(ordersResponse.data || []);
        setFavorites(favoritesResponse.data || []);
        setRestaurants(restaurantsResponse.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch data if user is authenticated
    if (!authLoading && currentUser) {
      fetchData();
    }
  }, [authLoading, currentUser]);

  // Create stats data from real API data
  const stats = [
    { 
      id: 'recent', 
      icon: 'bi-receipt', 
      value: orders.length, 
      label: 'Recent Orders',
      isEmpty: orders.length === 0
    },
    { 
      id: 'favorites', 
      icon: 'bi-heart', 
      value: favorites.length, 
      label: 'Favorites',
      isEmpty: favorites.length === 0
    },
    { 
      id: 'nearby', 
      icon: 'bi-geo-alt', 
      value: restaurants.length, 
      label: 'Nearby Restaurants',
      isEmpty: restaurants.length === 0
    }
  ];

  // Get most recent orders (maximum 2)
  const recentOrders = orders.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  ).slice(0, 2);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Show loading state if either auth or data is loading
  const isLoading = loading || authLoading;

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 76px)' }}>
      <div className="container py-5 mt-5">
        <div className="mb-4">
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
            {isLoading ? (
              <div className="spinner-border text-success me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <>Hello, {currentUser?.name || 'User'}!</>
            )}
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#9CA3AF', marginBottom: '2rem' }}>
            What would you like to eat today?
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-5" style={{ maxWidth: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Search for restaurants..." 
              style={{ 
                width: '100%', 
                backgroundColor: '#121212', 
                border: '1px solid #333',
                borderRadius: '50px',
                padding: '15px 20px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <button 
              style={{ 
                position: 'absolute', 
                right: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'none', 
                border: 'none', 
                color: '#06C167',
                cursor: 'pointer'
              }}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {/* Error message if API calls failed */}
        {error && (
          <div 
            style={{ 
              backgroundColor: 'rgba(220, 38, 38, 0.1)', 
              color: '#ef4444', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1.5rem' 
            }}
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Stats Section */}
        <div className="row g-4 mb-5">
          {stats.map((stat) => (
            <div key={stat.id} className="col-md-4">
              <Link 
                to={stat.id === 'recent' ? '/orders' : stat.id === 'favorites' ? '/favorites' : '/restaurants'} 
                style={{ textDecoration: 'none' }}
              >
                <div 
                  style={{ 
                    backgroundColor: '#121212', 
                    border: hoveredCard === stat.id ? '1px solid #06C167' : '1px solid #333',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    boxShadow: hoveredCard === stat.id ? '0 0 0 1px #06C167' : 'none'
                  }}
                  onMouseEnter={() => setHoveredCard(stat.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div 
                    style={{ 
                      marginRight: '15px',
                      color: '#06C167'
                    }}
                  >
                    <i className={`bi ${stat.icon}`} style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div style={{ color: '#9CA3AF' }}>
                      {stat.label}
                      {!isLoading && stat.isEmpty && " (None yet)"}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-5">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
            Quick Actions
          </h2>
          <div className="row g-4">
            {quickActions.map((action) => (
              <div key={action.id} className="col-md-6 col-lg-3">
                <div 
                  style={{ 
                    backgroundColor: '#121212', 
                    border: hoveredAction === action.id ? '1px solid #06C167' : '1px solid #333',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    boxShadow: hoveredAction === action.id ? '0 0 0 1px #06C167' : 'none'
                  }}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <i className={`bi ${action.icon}`} style={{ 
                      fontSize: '2rem', 
                      color: '#06C167'
                    }}></i>
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    marginBottom: '0.5rem',
                    color: 'white'
                  }}>
                    {action.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#9CA3AF', 
                    textAlign: 'center', 
                    marginBottom: '1.5rem'
                  }}>
                    {action.description}
                  </p>
                  <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                    <Link 
                      to={action.linkTo} 
                      style={{ 
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        backgroundColor: '#06C167',
                        color: 'white',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {action.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="mb-5">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0', color: 'white' }}>
              Recent Orders
            </h2>
            <Link 
              to="/orders" 
              style={{ 
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '50px',
                padding: '0.375rem 1rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#06C167';
                e.currentTarget.style.boxShadow = '0 0 0 1px #06C167';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View All
            </Link>
          </div>
          
          {/* Recent Orders Cards or Empty State */}
          {isLoading ? (
            <div style={{ 
              backgroundColor: '#121212', 
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ color: '#9CA3AF', marginTop: '1rem', marginBottom: '0' }}>
                Loading your orders...
              </p>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="row g-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="col-md-6">
                  <div 
                    style={{ 
                      backgroundColor: '#121212', 
                      border: hoveredOrder === order.id ? '1px solid #06C167' : '1px solid #333',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      boxShadow: hoveredOrder === order.id ? '0 0 0 1px #06C167' : 'none'
                    }}
                    onMouseEnter={() => setHoveredOrder(order.id)}
                    onMouseLeave={() => setHoveredOrder(null)}
                  >
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'white' }}>
                            {order.restaurant_name}
                          </h3>
                          <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0' }}>
                            {formatDate(order.created_at)} • #{order.id}
                          </p>
                        </div>
                        <span style={{
                          backgroundColor: '#06C167',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div style={{ 
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '1.25rem'
                      }}>
                        <Link
                          to={`/orders/${order.id}`}
                          style={{
                            flex: '1',
                            textAlign: 'center',
                            backgroundColor: '#06C167',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          View Details
                        </Link>
                        <button
                          style={{
                            flex: '1',
                            backgroundColor: 'transparent',
                            border: '1px solid #333',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              backgroundColor: '#121212', 
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <i className="bi bi-receipt" style={{ fontSize: '2rem', color: '#9CA3AF' }}></i>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginTop: '1rem' }}>
                No orders yet
              </h3>
              <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
                When you place an order, it will appear here
              </p>
              <Link 
                to="/restaurants" 
                style={{ 
                  display: 'inline-block',
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#06C167',
                  color: 'white',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Browse Restaurants
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;